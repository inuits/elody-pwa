/**
 * Tests for TableInputField, TableRow, and AutocompleteRelationCell
 */
import { shallowMount } from "@vue/test-utils";
import { flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref, nextTick } from "vue";
import { EditStatus, InputFieldTypes } from "@/generated-types/queries";
import type { SubField, InputField, BaseRelationValuesInput } from "@/generated-types/queries";

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

vi.mock("vee-validate", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vee-validate")>();
  return {
    ...actual,
    useFieldArray: vi.fn(() => ({
      fields: mockFields,
      push: mockPush,
      remove: mockRemove,
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

// ─── Lazy component imports (must come after vi.mock() calls) ─────────────────

const { default: TableInputField } = await import("@/components/base/TableInputField.vue");
const { default: TableRow } = await import("@/components/base/TableRow.vue");
const { default: AutocompleteRelationCell } = await import(
  "@/components/base/AutocompleteRelationCell.vue"
);
const { default: BaseButtonNew } = await import("@/components/base/BaseButtonNew.vue");
const { default: TableCellInputField } = await import("@/components/base/TableCellInputField.vue");
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

  // ── addRow ────────────────────────────────────────────────────────────────────

  describe("addRow — metadata mode", () => {
    it("calls useFieldArray.push with empty item on add click", async () => {
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

  // ── removeRow ─────────────────────────────────────────────────────────────────

  describe("removeRow", () => {
    it("calls useFieldArray.remove with the correct index", async () => {
      mockFields.value = [
        { key: "0", value: { name: "Alice" } },
        { key: "1", value: { name: "Bob" } },
      ];

      const wrapper = shallowMount(TableInputField, {
        props: { subFields: [textSubField], formId: "form-1", parentFieldKey: "authors" },
      });

      // Use name-based lookup since component refs may differ in the module graph
      await wrapper.findAllComponents({ name: "TableRow" })[0].vm.$emit("remove-row", 0);
      expect(mockRemove).toHaveBeenCalledWith(0);
    });
  });

  // ── row rendering ─────────────────────────────────────────────────────────────

  describe("row rendering", () => {
    it("renders one TableRow per field entry", () => {
      mockFields.value = [
        { key: "0", value: { name: "Alice" } },
        { key: "1", value: { name: "Bob" } },
      ];
      const wrapper = shallowMount(TableInputField, {
        props: { subFields: [textSubField], formId: "form-1", parentFieldKey: "authors" },
      });
      expect(wrapper.findAllComponents({ name: "TableRow" })).toHaveLength(2);
    });

    it("passes the fieldEntry value as item prop to TableRow", () => {
      mockFields.value = [{ key: "0", value: { name: "Alice" } }];
      const wrapper = shallowMount(TableInputField, {
        props: { subFields: [textSubField], formId: "form-1", parentFieldKey: "authors" },
      });
      expect(wrapper.findComponent({ name: "TableRow" }).props("item")).toEqual({ name: "Alice" });
    });

    it("passes parentFieldKey to TableRow", () => {
      mockFields.value = [{ key: "0", value: {} }];
      const wrapper = shallowMount(TableInputField, {
        props: { subFields: [textSubField], formId: "form-1", parentFieldKey: "authors" },
      });
      expect(wrapper.findComponent({ name: "TableRow" }).props("parentFieldKey")).toBe("authors");
    });
  });

  // ── relation mode ─────────────────────────────────────────────────────────────

  describe("relation mode", () => {
    it("passes relationType to TableRow when isFlowRelationValues is set", () => {
      mockFields.value = [{ key: "0", value: { name: "", function_indication: "", main_author: false } }];
      const wrapper = shallowMount(TableInputField, {
        props: {
          subFields: relationSubFields,
          formId: "form-1",
          parentFieldKey: "workAuthors",
          isFlowRelationValues: "refAuthors",
        },
      });
      expect(wrapper.findComponent({ name: "TableRow" }).props("relationType")).toBe("refAuthors");
    });

    it("does not pass relationType to TableRow in metadata mode", () => {
      mockFields.value = [{ key: "0", value: { name: "" } }];
      const wrapper = shallowMount(TableInputField, {
        props: { subFields: [textSubField], formId: "form-1", parentFieldKey: "authors" },
      });
      expect(wrapper.findComponent({ name: "TableRow" }).props("relationType")).toBeFalsy();
    });

    it("calls form.setFieldValue with valid relations on update-relation", async () => {
      mockFields.value = [{ key: "0", value: {} }];
      const wrapper = shallowMount(TableInputField, {
        props: {
          subFields: relationSubFields,
          formId: "form-1",
          parentFieldKey: "workAuthors",
          isFlowRelationValues: "refAuthors",
        },
      });

      const serialized: BaseRelationValuesInput = {
        key: "entity-uuid-1",
        type: "refAuthors",
        editStatus: EditStatus.New,
        metadata: [
          { key: "function_indication", value: "aut" },
          { key: "main_author", value: false },
        ],
      };

      await wrapper.findComponent({ name: "TableRow" }).vm.$emit("update-relation", 0, serialized);

      expect(mockSetFieldValue).toHaveBeenCalledWith("relationValues.refAuthors", [serialized]);
    });

    it("excludes null (empty-key) relations from setFieldValue", async () => {
      mockFields.value = [{ key: "0", value: {} }, { key: "1", value: {} }];
      const wrapper = shallowMount(TableInputField, {
        props: {
          subFields: relationSubFields,
          formId: "form-1",
          parentFieldKey: "workAuthors",
          isFlowRelationValues: "refAuthors",
        },
      });

      const serialized: BaseRelationValuesInput = {
        key: "entity-uuid-1",
        type: "refAuthors",
        editStatus: EditStatus.New,
        metadata: [],
      };

      const rows = wrapper.findAllComponents({ name: "TableRow" });
      await rows[0].vm.$emit("update-relation", 0, serialized);
      await rows[1].vm.$emit("update-relation", 1, null);

      expect(mockSetFieldValue).toHaveBeenLastCalledWith("relationValues.refAuthors", [serialized]);
    });

    it("cleans up serialized relation slot on removeRow", async () => {
      mockFields.value = [{ key: "0", value: {} }, { key: "1", value: {} }];
      const wrapper = shallowMount(TableInputField, {
        props: {
          subFields: relationSubFields,
          formId: "form-1",
          parentFieldKey: "workAuthors",
          isFlowRelationValues: "refAuthors",
        },
      });

      const rel0: BaseRelationValuesInput = {
        key: "entity-0",
        type: "refAuthors",
        editStatus: EditStatus.New,
        metadata: [],
      };
      const rel1: BaseRelationValuesInput = {
        key: "entity-1",
        type: "refAuthors",
        editStatus: EditStatus.New,
        metadata: [],
      };

      const rows = wrapper.findAllComponents({ name: "TableRow" });
      await rows[0].vm.$emit("update-relation", 0, rel0);
      await rows[1].vm.$emit("update-relation", 1, rel1);
      await rows[0].vm.$emit("remove-row", 0);

      const lastCall = mockSetFieldValue.mock.calls.at(-1);
      expect(lastCall?.[1]).toEqual([rel1]);
    });
  });
});

// ─── TableRow ─────────────────────────────────────────────────────────────────

describe("TableRow", () => {
  const mountRow = (item: Record<string, any>, relationType?: string) =>
    shallowMount(TableRow, {
      props: {
        rowIndex: 0,
        item,
        subFields: relationSubFields,
        formId: "form-1",
        parentFieldKey: "workAuthors",
        relationType,
        disabled: false,
      },
    });

  // ── TableCellInputField rendering ─────────────────────────────────────────────

  it("renders one TableCellInputField per subField", () => {
    const wrapper = mountRow({ name: "", function_indication: "", main_author: false });
    expect(wrapper.findAllComponents({ name: "TableCellInputField" })).toHaveLength(3);
  });

  it("passes the correct vee-validate fieldKey to each TableCellInputField", () => {
    const wrapper = mountRow({ name: "" });
    const cells = wrapper.findAllComponents({ name: "TableCellInputField" });
    expect(cells[0].props("fieldKey")).toBe("intialValues.workAuthors[0].name");
    expect(cells[1].props("fieldKey")).toBe("intialValues.workAuthors[0].function_indication");
    expect(cells[2].props("fieldKey")).toBe("intialValues.workAuthors[0].main_author");
  });

  it("passes formId to TableCellInputField", () => {
    const wrapper = mountRow({ name: "" });
    expect(wrapper.findAllComponents({ name: "TableCellInputField" })[0].props("formId")).toBe("form-1");
  });

  // ── removeRow ──────────────────────────────────────────────────────────────────

  it("emits remove-row with rowIndex when trash button clicked", async () => {
    const wrapper = shallowMount(TableRow, {
      props: {
        rowIndex: 2,
        item: { name: "" },
        subFields: [textSubField],
        formId: "form-1",
        parentFieldKey: "authors",
        disabled: false,
      },
    });
    await wrapper.findComponent({ name: "BaseButtonNew" }).vm.$emit("click");
    expect(wrapper.emitted("remove-row")?.[0]).toEqual([2]);
  });

  // ── relation serialization ─────────────────────────────────────────────────────

  describe("relation serialization", () => {
    it("emits update-relation null when relation key field is empty", async () => {
      const wrapper = mountRow(
        { name: "", function_indication: "aut", main_author: false },
        "refAuthors",
      );
      await nextTick();
      expect(wrapper.emitted("update-relation")?.[0]).toEqual([0, null]);
    });

    it("emits a valid BaseRelationValuesInput when relation key field is filled", async () => {
      const wrapper = mountRow(
        { name: "entity-uuid-1", function_indication: "aut", main_author: true },
        "refAuthors",
      );
      await nextTick();
      const rel = wrapper.emitted("update-relation")![0][1] as BaseRelationValuesInput;
      expect(rel.key).toBe("entity-uuid-1");
      expect(rel.type).toBe("refAuthors");
      expect(rel.editStatus).toBe(EditStatus.New);
    });

    it("puts isMetadataField=true sub-fields into relation.metadata", async () => {
      const wrapper = mountRow(
        { name: "entity-uuid-1", function_indication: "aut", main_author: true },
        "refAuthors",
      );
      await nextTick();
      const rel = wrapper.emitted("update-relation")![0][1] as BaseRelationValuesInput;
      expect(rel.metadata).toContainEqual({ key: "function_indication", value: "aut" });
      expect(rel.metadata).toContainEqual({ key: "main_author", value: true });
    });

    it("excludes the relation-key sub-field from metadata", async () => {
      const wrapper = mountRow(
        { name: "entity-uuid-1", function_indication: "aut", main_author: false },
        "refAuthors",
      );
      await nextTick();
      const rel = wrapper.emitted("update-relation")![0][1] as BaseRelationValuesInput;
      const metaKeys = (rel.metadata ?? []).map((m: any) => m.key);
      expect(metaKeys).not.toContain("name");
    });

    it("does not emit update-relation when relationType is not set", async () => {
      const wrapper = mountRow({ name: "entity-uuid-1" }); // no relationType
      await nextTick();
      expect(wrapper.emitted("update-relation")).toBeFalsy();
    });

    // Fragment components (multiple root nodes) need attachTo for setProps to work
    it("re-emits update-relation when props.item changes", async () => {
      const wrapper = shallowMount(TableRow, {
        attachTo: document.body,
        props: {
          rowIndex: 0,
          item: { name: "", function_indication: "", main_author: false },
          subFields: relationSubFields,
          formId: "form-1",
          parentFieldKey: "workAuthors",
          relationType: "refAuthors",
          disabled: false,
        },
      });
      await nextTick();
      expect(wrapper.emitted("update-relation")![0][1]).toBeNull();

      await wrapper.setProps({
        item: { name: "entity-uuid-2", function_indication: "edt", main_author: false },
      });
      await nextTick();

      const emits = wrapper.emitted("update-relation")!;
      const lastRel = emits[emits.length - 1][1] as BaseRelationValuesInput;
      expect(lastRel.key).toBe("entity-uuid-2");
    });
  });
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

  it("does not call addRelations from useFormHelper", async () => {
    const wrapper = shallowMount(AutocompleteRelationCell, {
      props: { modelValue: undefined, inputField, formId: "form-1" },
    });
    await wrapper
      .findComponent(BaseInputAutocomplete)
      .vm.$emit("update:modelValue", [{ value: "entity-uuid-42", label: "Author A" }]);

    expect(mockSetFieldValue).not.toHaveBeenCalled();
  });

  it("shows the existing modelValue as a selected option on mount", async () => {
    mockEntityDropdownOptions.value = [{ value: "entity-uuid-99", label: "Existing Author" }];

    const wrapper = shallowMount(AutocompleteRelationCell, {
      props: { modelValue: "entity-uuid-99", inputField, formId: "form-1" },
    });
    // Wait for onMounted async chain + Vue re-render
    await flushPromises();
    await nextTick();
    await nextTick();

    const autocomplete = wrapper.findComponent(BaseInputAutocomplete);
    const selected = autocomplete.props("modelValue") as any[];
    expect(selected.some((o: any) => o.value === "entity-uuid-99")).toBe(true);

    mockEntityDropdownOptions.value = [];
  });
});
