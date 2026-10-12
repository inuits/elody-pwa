import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, nextTick } from "vue";
import { useForm, type FormContext } from "vee-validate";
import {
  useRepeatableFields,
  type UseRepeatableFields,
} from "@/composables/useRepeatableFields";

const forms: Record<string, FormContext<any>> = {};
vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({
    getForm: (id: string) => forms[id],
    addEditableMetadataKeys: vi.fn(),
  }),
}));

// The rows as a page shows them: the stored list, with each row's fields
// seeded into the form (as every field row does when it mounts).
const mountRows = async (stored: Record<string, unknown>[]) => {
  let helper!: UseRepeatableFields;
  let form!: FormContext<any>;
  mount(
    defineComponent({
      setup() {
        form = useForm({
          initialValues: { intialValues: { isbn_group: stored } },
        });
        forms["F"] = form;
        helper = useRepeatableFields("isbn_group", "F");
        helper.init();
        return () => null;
      },
    }),
  );
  stored.forEach((row, index) =>
    Object.entries(row).forEach(([key, value]) =>
      form.setFieldValue(
        `intialValues.repeatable-panels.isbn_group[${index}].${key}` as any,
        value,
      ),
    ),
  );
  await nextTick();
  return { helper, form };
};

describe("useRepeatableFields — rows edited in place", () => {
  it("saves every saved row, keeping stored keys no field shows", async () => {
    const { helper, form } = await mountRows([
      { isbn: "111", hidden: "keep" },
      { isbn: "222" },
    ]);
    form.setFieldValue(
      "intialValues.repeatable-panels.isbn_group[1].isbn" as any,
      "333",
    );
    expect(helper.rowsForSave(1)).toEqual([
      { isbn: "111", hidden: "keep" },
      { isbn: "333" },
    ]);
  });

  it("leaves an unsaved new row out, unless it is the row being saved", async () => {
    const { helper } = await mountRows([{ isbn: "111" }]);
    helper.addRow();
    await nextTick();
    expect(helper.rowsForSave(0)).toEqual([{ isbn: "111" }]);
    expect(helper.rowsForSave(1)).toEqual([{ isbn: "111" }, {}]);
  });

  it("leaves a removed row out of the rows to save", async () => {
    const { helper } = await mountRows([{ isbn: "111" }, { isbn: "222" }]);
    expect(helper.rowsWithout(0)).toEqual([{ isbn: "222" }]);
  });

  it("adds an empty row that stays unsaved until it is saved", async () => {
    const { helper } = await mountRows([{ isbn: "111" }]);
    expect(helper.hasUnsavedRow()).toBe(false);
    helper.addRow();
    expect(helper.fields.value).toHaveLength(2);
    expect(helper.isStoredRow(1)).toBe(false);
    expect(helper.hasUnsavedRow()).toBe(true);
    helper.markSaved([{ isbn: "111" }, { isbn: "222" }]);
    expect(helper.isStoredRow(1)).toBe(true);
    expect(helper.hasUnsavedRow()).toBe(false);
  });

  it("adds no second empty row: it hands back the unsaved one", async () => {
    const { helper } = await mountRows([{ isbn: "111" }]);
    expect(helper.addRow()).toBe(1);
    expect(helper.addRow()).toBe(1);
    expect(helper.fields.value).toHaveLength(2);
  });

  it("hands back the empty row of a panel without values", async () => {
    const { helper } = await mountRows([]);
    expect(helper.addRow()).toBe(0);
    expect(helper.fields.value).toHaveLength(1);
  });

  it("counts the empty row of a panel without values as unsaved", async () => {
    const { helper } = await mountRows([]);
    expect(helper.hasUnsavedRow()).toBe(true);
    expect(helper.canRemoveRow(0)).toBe(false);
  });

  it("drops an unsaved new row without saving", async () => {
    const { helper } = await mountRows([{ isbn: "111" }]);
    helper.addRow();
    expect(helper.canRemoveRow(1)).toBe(true);
    helper.discardUnsavedRow(1);
    expect(helper.fields.value).toHaveLength(1);
  });

  it("never drops a saved row without saving", async () => {
    const { helper } = await mountRows([{ isbn: "111" }, { isbn: "222" }]);
    helper.discardUnsavedRow(1);
    expect(helper.fields.value).toHaveLength(2);
  });

  it("removes a saved row and keeps one empty row when none are left", async () => {
    const { helper } = await mountRows([{ isbn: "111" }]);
    helper.removeSavedRow(0, []);
    await nextTick();
    expect(helper.fields.value).toHaveLength(1);
    expect(helper.isStoredRow(0)).toBe(false);
  });
});
