import { describe, it, expect, vi, beforeEach } from "vitest";
import { useEntityEditor } from "../useEntityEditor";
import { Collection } from "@/generated-types/queries";

vi.mock("vue", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue")>();
  return {
    ...actual,
    inject: vi.fn((key) => {
      if (key === "config") return { locale: "en" };
      return {};
    }),
  };
});

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const mockMutate = vi.fn();
vi.mock("@vue/apollo-composable", () => ({
  useMutation: () => ({ mutate: mockMutate }),
}));

vi.mock("@/main", () => ({
  apolloClient: { query: vi.fn() },
}));

const mockParseFormValuesToFormInput = vi.fn();
vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({
    createForm: vi.fn(),
    parseFormValuesToFormInput: mockParseFormValuesToFormInput,
    addEditableMetadataKeys: vi.fn(),
  }),
}));

const mockDisplaySuccessNotification = vi.fn();
vi.mock("@/composables/useBaseNotification", () => ({
  useBaseNotification: () => ({
    displaySuccessNotification: mockDisplaySuccessNotification,
  }),
}));

vi.mock("@/composables/useImport", () => ({
  useImport: () => ({ loadDocument: vi.fn() }),
}));

vi.mock("@/helpers", () => ({
  getChildrenOfHomeRoutes: vi.fn(() => []),
  deepToRaw: vi.fn((val) => val),
}));

vi.mock("@/components/metadata/useVeeValidate", () => ({
  useVeeValidate: () => ({ getVeeValidateKey: vi.fn() }),
}));

describe("useEntityEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Scenario 1: Standard Save (validates, formats, and saves filled data)", async () => {
    const { save, form, editableFields, isSaving } = useEntityEditor();

    form.value = {
      validate: vi.fn().mockResolvedValue({ valid: true }),
      values: { myField: "Filled Value" },
    };

    editableFields.value = [{ key: "myField", inputField: true } as any];

    const mockFormInput = {
      metadata: [{ key: "myField", value: "Filled Value" }],
    };
    mockParseFormValuesToFormInput.mockReturnValue(mockFormInput);

    mockMutate.mockResolvedValue({ data: { mutateEntityValues: true } });

    const mockCallback = vi.fn();

    const result = await save("entity-123", "SomeType", mockCallback, false);

    expect(form.value.validate).toHaveBeenCalled();

    expect(mockParseFormValuesToFormInput).toHaveBeenCalledWith(
      "entity-123",
      { myField: "Filled Value" },
      false,
      "en",
      { myField: { key: "myField", inputField: true } },
    );

    expect(mockMutate).toHaveBeenCalledWith({
      id: "entity-123",
      collection: Collection.Entities,
      formInput: {
        metadata: [{ key: "myField", value: "Filled Value" }],
      },
    });

    expect(mockDisplaySuccessNotification).toHaveBeenCalled();
    expect(mockCallback).toHaveBeenCalled();
    expect(result).toBe(true);
    expect(isSaving.value).toBe(false);
  });

  it("Scenario 2: Removal Save (overrides metadata values to empty strings)", async () => {
    const { save, form, editableFields } = useEntityEditor();

    form.value = {
      validate: vi.fn().mockResolvedValue({ valid: true }),
      values: { field1: "Old Value 1", field2: "Old Value 2" },
    };

    editableFields.value = [
      { key: "field1", inputField: true } as any,
      { key: "field2", inputField: true } as any,
    ];

    const mockFormInput = {
      metadata: [
        { key: "field1", value: "Old Value 1" },
        { key: "field2", value: "Old Value 2" },
      ],
    };
    mockParseFormValuesToFormInput.mockReturnValue(
      JSON.parse(JSON.stringify(mockFormInput)),
    );

    mockMutate.mockResolvedValue({ data: { mutateEntityValues: true } });

    const result = await save("entity-123", "SomeType", undefined, true);

    expect(mockMutate).toHaveBeenCalledWith({
      id: "entity-123",
      collection: Collection.Entities,
      formInput: {
        metadata: [
          { key: "field1", value: "" },
          { key: "field2", value: "" },
        ],
      },
    });

    expect(result).toBe(true);
  });
});
