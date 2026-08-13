import { describe, it, expect, vi, beforeEach } from "vitest";
import { useBlockEditor } from "@/composables/useBlockEditor";
import type { PanelMetaData } from "@/generated-types/queries";

const mocks = vi.hoisted(() => ({
  mutate: vi.fn().mockResolvedValue({ data: { mutateEntityValues: {} } }),
  form: {
    values: {} as Record<string, any>,
    validateField: vi.fn().mockResolvedValue({ valid: true, errors: [] }),
    setFieldValue: vi.fn(),
  },
}));

vi.mock("@vue/apollo-composable", () => ({
  useMutation: () => ({ mutate: mocks.mutate }),
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({ meta: { type: "entities" } }),
}));

vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({
    getForm: () => mocks.form,
    parseRelationValuesForFormSubmit: (relationValues: Record<string, any>) =>
      Object.values(relationValues)
        .flat()
        .filter((relation: any) => relation?.editStatus),
  }),
}));

const field = (key: string, extra: Record<string, unknown> = {}) =>
  ({
    __typename: "PanelMetaData",
    key,
    inputField: { type: "text", ...extra },
  }) as unknown as PanelMetaData;

describe("useBlockEditor", () => {
  beforeEach(() => {
    mocks.mutate.mockClear();
    mocks.form.setFieldValue.mockClear();
    mocks.form.validateField.mockResolvedValue({ valid: true, errors: [] });
    mocks.form.values = {
      intialValues: { place: "Breda", publisher_year: "2026", untouched: "x" },
      relationValues: {},
    };
  });

  it("saves only the keys that changed, in one mutation", async () => {
    const editor = useBlockEditor("entity-1");
    editor.start();
    mocks.form.values.intialValues.place = "Antwerpen";

    const saved = await editor.save(
      [field("place"), field("publisher_year"), field("untouched")],
      ["intialValues.place", "intialValues.publisher_year"],
    );

    expect(saved).toBe(true);
    expect(mocks.mutate).toHaveBeenCalledTimes(1);
    expect(mocks.mutate.mock.calls[0][0].formInput).toEqual({
      metadata: [{ key: "place", value: "Antwerpen" }],
      relations: [],
    });
    expect(editor.isEditingBlock.value).toBe(false);
  });

  it("skips the mutation entirely when nothing changed", async () => {
    const editor = useBlockEditor("entity-1");
    editor.start();

    const saved = await editor.save([field("place")], ["intialValues.place"]);

    expect(saved).toBe(true);
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it("cancel restores the snapshot", () => {
    const editor = useBlockEditor("entity-1");
    editor.start();
    mocks.form.values.intialValues.place = "weggegooid";

    editor.cancel();

    expect(mocks.form.setFieldValue).toHaveBeenCalledWith("intialValues", {
      place: "Breda",
      publisher_year: "2026",
      untouched: "x",
    });
    expect(editor.isEditingBlock.value).toBe(false);
  });

  it("blocks the save when a field fails validation", async () => {
    const editor = useBlockEditor("entity-1");
    editor.start();
    mocks.form.values.intialValues.place = "";
    mocks.form.validateField.mockResolvedValueOnce({
      valid: false,
      errors: ["Plaats is verplicht zodra er een uitgever staat"],
    });

    const saved = await editor.save([field("place")], ["intialValues.place"]);

    expect(saved).toBe(false);
    expect(mocks.mutate).not.toHaveBeenCalled();
    expect(editor.blockError.value).toBe(
      "Plaats is verplicht zodra er een uitgever staat",
    );
    expect(editor.isEditingBlock.value).toBe(true);
  });

  it("saves a repeatable group as one whole-array entry", async () => {
    mocks.form.values.intialValues = {
      isbn_group: [{ isbn: "111" }],
      "repeatable-panels": {
        isbn_group: { 0: { isbn: "111" }, 1: { isbn: "9789465350387" } },
      },
    };
    const editor = useBlockEditor("entity-1");
    editor.start();

    const saved = await editor.save([field("isbn")], [], "isbn_group");

    expect(saved).toBe(true);
    expect(mocks.mutate.mock.calls[0][0].formInput.metadata).toEqual([
      {
        key: "isbn_group",
        value: [{ isbn: "111" }, { isbn: "9789465350387" }],
      },
    ]);
    // view-mode source array is synced after the save
    expect(mocks.form.setFieldValue).toHaveBeenCalledWith(
      "intialValues.isbn_group",
      [{ isbn: "111" }, { isbn: "9789465350387" }],
    );
  });

  it("keeps drafts and surfaces the error when the mutation fails", async () => {
    mocks.mutate.mockRejectedValueOnce(new Error("server said no"));
    const editor = useBlockEditor("entity-1");
    editor.start();
    mocks.form.values.intialValues.place = "Antwerpen";

    const saved = await editor.save([field("place")], []);

    expect(saved).toBe(false);
    expect(editor.blockError.value).toContain("server said no");
    expect(editor.isEditingBlock.value).toBe(true);
  });
});
