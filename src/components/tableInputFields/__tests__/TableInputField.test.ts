/**
 * Tests for TableInputField, TableCellInputField, and AutocompleteRelationCell
 */
import { shallowMount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import { useField } from "vee-validate";
import { EditStatus, InputFieldTypes } from "@/generated-types/queries";
import type { SubField, InputField } from "@/generated-types/queries";

// ─── vee-validate mock ────────────────────────────────────────────────────────

const mockFields = ref<Array<{ key: string; value: Record<string, any> }>>([]);
const mockPush = vi.fn((item: Record<string, any>) => {
  mockFields.value = [
    ...mockFields.value,
    { key: String(mockFields.value.length), value: { ...item } },
  ];
});
const mockRemove = vi.fn((i: number) => {
  mockFields.value = mockFields.value.filter((_, idx) => idx !== i);
});
const mockReplace = vi.fn();

vi.mock("vee-validate", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vee-validate")>();
  return {
    ...actual,
    useFieldArray: vi.fn(() => ({
      fields: mockFields,
      push: mockPush,
      remove: mockRemove,
      replace: mockReplace,
    })),
    useField: vi.fn(() => ({
      value: ref(""),
      errorMessage: ref(""),
    })),
  };
});

// ─── useFormHelper mock ───────────────────────────────────────────────────────

const mockSetFieldValue = vi.fn();
const mockGetForm = vi.fn(() => ({ setFieldValue: mockSetFieldValue }));
vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: vi.fn(() => ({
    getForm: mockGetForm,
  })),
}));

// ─── vue-i18n mock ────────────────────────────────────────────────────────────

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

// ─── useFieldValidation mock ──────────────────────────────────────────────────

vi.mock("@/components/metadata/useFieldValidation", () => ({
  useFieldValidation: vi.fn(() => ({
    getValidationRules: vi.fn(() => "no_xss"),
  })),
}));

// ─── useGetDropdownOptions mock ───────────────────────────────────────────────

const mockEntityDropdownOptions = ref<any[]>([]);
vi.mock("@/composables/useGetDropdownOptions", () => ({
  useGetDropdownOptions: vi.fn(() => ({
    entityDropdownOptions: mockEntityDropdownOptions,
    entitiesLoading: ref(false),
    initialize: vi.fn().mockResolvedValue(undefined),
    getAutocompleteOptions: vi.fn(),
    getFormWithRelationFieldCheck: vi.fn(),
  })),
}));

// ─── useManageEntities mock ───────────────────────────────────────────────────

vi.mock("@/composables/useManageEntities", () => ({
  useManageEntities: vi.fn(() => ({
    createEntity: vi.fn(),
  })),
}));

// ─── helpers mock (getTranslatedMessage uses i18n.global which is unavailable in tests) ───

vi.mock("@/helpers", () => ({
  getTranslatedMessage: vi.fn((key: string) => key),
}));

// ─── Lazy component imports (must come after vi.mock() calls) ─────────────────

const { default: TableInputField } = await import("@/components/tableInputFields/TableInputField.vue");
const { default: TableCellInputField } = await import("@/components/tableInputFields/TableCellInputField.vue");
const { default: AutocompleteRelationCell } = await import(
  "@/components/tableInputFields/AutocompleteRelationCell.vue"
);
const { default: BaseButtonNew } = await import("@/components/base/BaseButtonNew.vue");
const { default: BaseInputAutocomplete } = await import(
  "@/components/base/BaseInputAutocomplete.vue"
);

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeSubField(
  key: string,
  label: string,
  type: InputFieldTypes,
  isMetadataField = true,
  options: any[] = [],
): SubField {
  return {
    key,
    label,
    inputField: {
      type,
      isMetadataField,
      options: options.length ? options : undefined,
    } as InputField,
  };
}

const textSubField = makeSubField("name", "metadata.labels.name", InputFieldTypes.Text);
const checkboxSubField = makeSubField("active", "metadata.labels.active", InputFieldTypes.Checkbox);
const dropdownSubField = makeSubField("status", "metadata.labels.status", InputFieldTypes.Dropdown);

// Relation mode sub-fields: one relation-key field + two metadata fields
const relationKeySubField = makeSubField(
  "name",
  "metadata.labels.name",
  InputFieldTypes.DropdownSingleselectRelations,
  false, // isMetadataField: false → this is the relation key
);
const functionSubField = makeSubField(
  "function_indication",
  "metadata.labels.function",
  InputFieldTypes.Dropdown,
  true,
  [{ label: "aut", value: "aut" }],
);
const mainAuthorSubField = makeSubField(
  "main_author",
  "metadata.labels.main-author",
  InputFieldTypes.Checkbox,
  true,
);

const relationSubFields = [relationKeySubField, functionSubField, mainAuthorSubField];

// Flat item as it arrives from copyValueFromParent / vee-validate initFields pre-seeding
const flatAuthor = {
  name: "RUEB, M",
  function_indication: "aut",
  main_author: true,
  key: "__vue_devtool_undefined__",
  metadata: [{ value: "__vue_devtool_undefined__" }, { value: "__vue_devtool_undefined__" }],
};

// Correctly serialized BaseRelationValuesInput shape
const serializedAuthor = {
  key: "RUEB, M",
  type: "ref_work_authors",
  editStatus: EditStatus.New,
  metadata: [
    { key: "function_indication", value: "aut" },
    { key: "main_author", value: true },
  ],
};

// ─── TableInputField ──────────────────────────────────────────────────────────

describe("TableInputField", () => {
  beforeEach(() => {
    mockFields.value = [];
    vi.clearAllMocks();
    mockGetForm.mockReturnValue({ setFieldValue: mockSetFieldValue });
  });

  // ── visibility ───────────────────────────────────────────────────────────────

  describe("visibility", () => {
    it("renders nothing when subFields is empty", () => {
      const wrapper = shallowMount(TableInputField, {
        props: { subFields: [], formId: "form-1", parentFieldKey: "authors" },
      });
      expect(wrapper.find(".relation-metadata-list-field").exists()).toBe(false);
    });

    it("renders the table when subFields has entries", () => {
      const wrapper = shallowMount(TableInputField, {
        props: { subFields: [textSubField], formId: "form-1", parentFieldKey: "authors" },
      });
      expect(wrapper.find(".relation-metadata-list-field").exists()).toBe(true);
    });
  });

  // ── add button ────────────────────────────────────────────────────────────────

  describe("add button", () => {
    it("is visible when not disabled", () => {
      const wrapper = shallowMount(TableInputField, {
        props: { subFields: [textSubField], formId: "form-1", parentFieldKey: "authors", disabled: false },
      });
      expect(wrapper.find(".absolute.top-0.right-0").exists()).toBe(true);
    });

    it("is hidden when disabled", () => {
      const wrapper = shallowMount(TableInputField, {
        props: { subFields: [textSubField], formId: "form-1", parentFieldKey: "authors", disabled: true },
      });
      expect(wrapper.find(".absolute.top-0.right-0").exists()).toBe(false);
    });
  });

  // ── grid style ────────────────────────────────────────────────────────────────

  describe("grid style", () => {
    it("uses minmax for non-checkbox columns", () => {
      const wrapper = shallowMount(TableInputField, {
        props: { subFields: [textSubField], formId: "form-1", parentFieldKey: "authors", disabled: true },
      });
      expect(wrapper.find(".grid").attributes("style")).toContain("minmax(max-content, 1fr)");
    });

    it("uses max-content for checkbox columns", () => {
      const wrapper = shallowMount(TableInputField, {
        props: { subFields: [checkboxSubField], formId: "form-1", parentFieldKey: "authors", disabled: true },
      });
      const style = wrapper.find(".grid").attributes("style") ?? "";
      expect(style).toContain("max-content");
      expect(style).not.toContain("minmax");
    });

    it("adds an action column when not disabled", () => {
      const countCols = (w: any) =>
        ((w.find(".grid").attributes("style") ?? "") as string)
          .split(" ")
          .filter((s: string) => s.includes("content") || s.includes("minmax")).length;

      const editable = shallowMount(TableInputField, {
        props: { subFields: [textSubField], formId: "f", parentFieldKey: "k", disabled: false },
      });
      const disabled = shallowMount(TableInputField, {
        props: { subFields: [textSubField], formId: "f", parentFieldKey: "k", disabled: true },
      });
      expect(countCols(editable)).toBe(countCols(disabled) + 1);
    });
  });

  // ── addRow — metadata mode ────────────────────────────────────────────────────

  describe("addRow — metadata mode", () => {
    it("calls useFieldArray.push with empty flat item on add click", async () => {
      const wrapper = shallowMount(TableInputField, {
        props: { subFields: [textSubField, checkboxSubField], formId: "form-1", parentFieldKey: "authors" },
      });
      await wrapper.findAllComponents(BaseButtonNew)[0].vm.$emit("click");
      expect(mockPush).toHaveBeenCalledWith({ name: "", active: false });
    });

    it("initialises Text sub-fields to empty string", async () => {
      const wrapper = shallowMount(TableInputField, {
        props: { subFields: [textSubField], formId: "form-1", parentFieldKey: "authors" },
      });
      await wrapper.findAllComponents(BaseButtonNew)[0].vm.$emit("click");
      expect(mockPush.mock.calls[0][0].name).toBe("");
    });

    it("initialises Checkbox sub-fields to false", async () => {
      const wrapper = shallowMount(TableInputField, {
        props: { subFields: [checkboxSubField], formId: "form-1", parentFieldKey: "authors" },
      });
      await wrapper.findAllComponents(BaseButtonNew)[0].vm.$emit("click");
      expect(mockPush.mock.calls[0][0].active).toBe(false);
    });

    it("initialises Dropdown sub-fields to empty string", async () => {
      const wrapper = shallowMount(TableInputField, {
        props: { subFields: [dropdownSubField], formId: "form-1", parentFieldKey: "authors" },
      });
      await wrapper.findAllComponents(BaseButtonNew)[0].vm.$emit("click");
      expect(mockPush.mock.calls[0][0].status).toBe("");
    });
  });

  // ── addRow — relation mode ────────────────────────────────────────────────────

  describe("addRow — relation mode", () => {
    it("pushes a BaseRelationValuesInput-shaped item with empty key", async () => {
      const wrapper = shallowMount(TableInputField, {
        props: {
          subFields: relationSubFields,
          formId: "form-1",
          parentFieldKey: "relationValues.refAuthors",
          relationType: "refAuthors",
        },
      });
      await wrapper.findAllComponents(BaseButtonNew)[0].vm.$emit("click");
      const pushed = mockPush.mock.calls[0][0];
      expect(pushed.key).toBe("");
      expect(pushed.type).toBe("refAuthors");
      expect(pushed.editStatus).toBe(EditStatus.New);
    });

    it("includes metadata entries for each isMetadataField=true sub-field", async () => {
      const wrapper = shallowMount(TableInputField, {
        props: {
          subFields: relationSubFields,
          formId: "form-1",
          parentFieldKey: "relationValues.refAuthors",
          relationType: "refAuthors",
        },
      });
      await wrapper.findAllComponents(BaseButtonNew)[0].vm.$emit("click");
      const pushed = mockPush.mock.calls[0][0];
      expect(pushed.metadata).toContainEqual({ key: "function_indication", value: "" });
      expect(pushed.metadata).toContainEqual({ key: "main_author", value: false });
    });

    it("does not include the relation-key sub-field in metadata", async () => {
      const wrapper = shallowMount(TableInputField, {
        props: {
          subFields: relationSubFields,
          formId: "form-1",
          parentFieldKey: "relationValues.refAuthors",
          relationType: "refAuthors",
        },
      });
      await wrapper.findAllComponents(BaseButtonNew)[0].vm.$emit("click");
      const pushed = mockPush.mock.calls[0][0];
      const metaKeys = (pushed.metadata ?? []).map((m: any) => m.key);
      expect(metaKeys).not.toContain("name");
    });
  });

  // ── initial seeding from modelValue ──────────────────────────────────────────
  //
  // These tests cover the copyValueFromParent use case:
  // - modelValue arrives as flat objects (name, function_indication, main_author, ...)
  // - TableInputField must convert them to BaseRelationValuesInput shape before storing
  //
  // Two scenarios:
  //   A) fields is empty when the watcher fires (normal path)
  //   B) fields is already pre-populated with flat items by vee-validate's initFields()
  //      (flush:'sync' beats our flush:'pre' watcher — the actual bug)

  describe("initial seeding from modelValue", () => {
    it("pushes serialized BaseRelationValuesInput when fields is empty and modelValue has flat items", () => {
      mockFields.value = [];

      shallowMount(TableInputField, {
        props: {
          modelValue: [flatAuthor],
          subFields: relationSubFields,
          formId: "form-1",
          parentFieldKey: "relationValues.ref_work_authors",
          relationType: "ref_work_authors",
        },
      });

      expect(mockPush).toHaveBeenCalledWith(serializedAuthor);
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("calls replace with serialized items when fields is already pre-populated with flat items", () => {
      // Simulate vee-validate's initFields() having pre-seeded fields with flat items
      // before our Vue watcher ran (the actual bug scenario)
      mockFields.value = [{ key: "0", value: { ...flatAuthor } }];

      shallowMount(TableInputField, {
        props: {
          modelValue: [flatAuthor],
          subFields: relationSubFields,
          formId: "form-1",
          parentFieldKey: "relationValues.ref_work_authors",
          relationType: "ref_work_authors",
        },
      });

      expect(mockReplace).toHaveBeenCalledWith([serializedAuthor]);
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("does not push or replace when modelValue is already in BaseRelationValuesInput shape", () => {
      mockFields.value = [{ key: "0", value: { ...serializedAuthor } }];

      shallowMount(TableInputField, {
        props: {
          modelValue: [serializedAuthor],
          subFields: relationSubFields,
          formId: "form-1",
          parentFieldKey: "relationValues.ref_work_authors",
          relationType: "ref_work_authors",
        },
      });

      expect(mockPush).not.toHaveBeenCalled();
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("does not push or replace again when modelValue changes to already-serialized data", async () => {
      mockFields.value = [];

      const wrapper = shallowMount(TableInputField, {
        props: {
          modelValue: [flatAuthor],
          subFields: relationSubFields,
          formId: "form-1",
          parentFieldKey: "relationValues.ref_work_authors",
          relationType: "ref_work_authors",
        },
      });

      // First seeding happened at mount (push called once)
      expect(mockPush).toHaveBeenCalledTimes(1);

      // Simulate modelValue changing (e.g. reactive feedback from replace())
      await wrapper.setProps({ modelValue: [serializedAuthor] });

      // Should NOT push or replace again
      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });

  // ── row deletion ──────────────────────────────────────────────────────────────
  //
  // Regression tests for: deleting the middle row of 3 pre-loaded rows also
  // removing the last row from the UI.
  //
  // Root cause: TableCellInputField calls useField(props.fieldKey) with a plain
  // string — the path is fixed at mount time. When remove(1) shifts row 2 → index 1,
  // the cell's useField is still bound to authors[2].name which vee-validate no
  // longer has, so the cell reads undefined and appears blank/deleted.
  //
  // Fix: pass a getter () => props.fieldKey so the binding is reactive.

});



// ─── AutocompleteRelationCell ─────────────────────────────────────────────────

describe("AutocompleteRelationCell", () => {
  const inputField: InputField = {
    type: InputFieldTypes.DropdownSingleselectRelations,
    isMetadataField: false,
    relationType: "refAuthors",
    advancedFilterInputForSearchingOptions: {
      type: "text" as any,
      key: ["name"],
      value: "*",
      match_exact: false,
    },
    advancedFilterInputForRetrievingOptions: [] as any,
    advancedFilterInputForRetrievingAllOptions: [] as any,
  };

  it("renders BaseInputAutocomplete", () => {
    const wrapper = shallowMount(AutocompleteRelationCell, {
      props: { modelValue: undefined, inputField, formId: "form-1" },
    });
    expect(wrapper.findComponent(BaseInputAutocomplete).exists()).toBe(true);
  });

  it("emits update:modelValue with entity ID on selection", async () => {
    const wrapper = shallowMount(AutocompleteRelationCell, {
      props: { modelValue: undefined, inputField, formId: "form-1" },
    });
    await wrapper
      .findComponent(BaseInputAutocomplete)
      .vm.$emit("update:modelValue", [{ value: "entity-uuid-42", label: "Author A" }]);

    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["entity-uuid-42"]);
  });

  it("does not call setFieldValue from useFormHelper", async () => {
    const wrapper = shallowMount(AutocompleteRelationCell, {
      props: { modelValue: undefined, inputField, formId: "form-1" },
    });
    await wrapper
      .findComponent(BaseInputAutocomplete)
      .vm.$emit("update:modelValue", [{ value: "entity-uuid-42", label: "Author A" }]);

    expect(mockSetFieldValue).not.toHaveBeenCalled();
  });

});

// ─── TableCellInputField ──────────────────────────────────────────────────────
//
// The key regression: TableCellInputField must pass a getter (() => props.fieldKey)
// to useField instead of a plain string. Without it, when rowIndex shifts after a
// deletion (e.g. row 2 becomes row 1), the cell keeps reading from the now-stale
// authors[2].name path which vee-validate has already cleared, causing the last row
// to appear as if it was deleted too.

describe("TableCellInputField", () => {
  beforeEach(() => {
    vi.mocked(useField).mockClear();
  });

  it("passes a getter function — not a plain string — to useField", () => {
    shallowMount(TableCellInputField, {
      props: {
        modelValue: "Alice",
        subField: textSubField,
        fieldKey: "authors[2].name",
        formId: "form-1",
      },
    });

    expect(vi.mocked(useField)).toHaveBeenCalledOnce();
    const firstArg = vi.mocked(useField).mock.calls[0][0];
    expect(typeof firstArg).toBe("function");
  });

  it("the getter returns the current fieldKey at mount time", () => {
    shallowMount(TableCellInputField, {
      props: {
        modelValue: "Alice",
        subField: textSubField,
        fieldKey: "authors[2].name",
        formId: "form-1",
      },
    });

    const getter = vi.mocked(useField).mock.calls[0][0] as () => string;
    expect(getter()).toBe("authors[2].name");
  });

  it("the getter reflects the updated fieldKey after a rowIndex shift (regression for middle-row deletion bug)", async () => {
    const wrapper = shallowMount(TableCellInputField, {
      props: {
        modelValue: "Charlie",
        subField: textSubField,
        fieldKey: "authors[2].name",
        formId: "form-1",
      },
    });

    // Grab the getter that was passed to useField at mount
    const getter = vi.mocked(useField).mock.calls[0][0] as () => string;
    expect(getter()).toBe("authors[2].name");

    // Simulate the rowIndex shifting from 2 → 1 after the middle row is deleted
    await wrapper.setProps({ fieldKey: "authors[1].name" });

    // The getter must now return the new path so vee-validate reads the correct value
    expect(getter()).toBe("authors[1].name");
  });
});
