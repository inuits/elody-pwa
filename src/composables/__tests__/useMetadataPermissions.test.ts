import { describe, it, expect, vi, beforeEach } from "vitest";
import { useMetadataWrapper } from "../../components/metadata/useMetadataWrapper";
import { ref, nextTick, defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { getEntityIdFromRoute } from "@/helpers";

const mockEditableFields = ref<Record<string, string[]>>({});

const mocks = vi.hoisted(() => {
  return {
    getForm: vi.fn(),
    getEntityIdFromRoute: vi.fn(),
  };
});

vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({
    editableFields: mockEditableFields,
    getForm: mocks.getForm,
  }),
}));

vi.mock("@/components/metadata/useVeeValidate", () => ({
  useVeeValidate: () => ({
    getVeeValidateKey: () => "mocked-field-key",
  }),
}));

vi.mock("@/components/metadata/useFieldValidation", () => ({
  useFieldValidation: () => ({
    getValidationRules: () => "required",
  }),
}));

vi.mock("@/helpers", () => ({
  getTranslatedMessage: vi.fn((key: string) => key),
  getEntityIdFromRoute: mocks.getEntityIdFromRoute,
}));

vi.mock("vee-validate", () => ({
  useField: vi.fn(() => ({
    value: ref(null),
    meta: { valid: true, dirty: false },
  })),
}));

const mountComposable = (props: any) => {
  let result: any;
  const TestComponent = defineComponent({
    setup() {
      result = useMetadataWrapper(props);
      return () => h("div");
    },
  });
  const wrapper = mount(TestComponent);
  return { result, wrapper };
};

describe("useMetadataWrapper", () => {
  const defaultProps = {
    metadata: {
      key: "testField",
      label: "Test Field",
      permitted: true,
      readOnly: false,
      value: "initial",
      __typename: "PanelMetaData",
    },
    formId: "form-123",
    isEdit: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockEditableFields.value = { "form-123": ["testField"] };
  });

describe("Permissions for displaying & editing", () => {
    it("should allow everything if the graphql layer permitted the field", async () => {
      const { result } = mountComposable(defaultProps);

      await nextTick(); 
      await new Promise(resolve => setTimeout(resolve, 0)); 

      expect(result.fieldIsPermittedToBeSeenByUser.value).toBe(true);
      expect(result.fieldIsEditableByUser.value).toBe(true);
    });

    it("keeps a field the graphql layer did not mark read-only editable", async () => {
      const props = {
        ...defaultProps,
        metadata: { ...defaultProps.metadata, readOnly: false },
      };

      const { result } = mountComposable(props);
      
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(result.fieldIsEditableByUser.value).toBe(true);
    });

    it("makes a field the graphql layer marked read-only uneditable", async () => {
      const props = {
        ...defaultProps,
        metadata: { ...defaultProps.metadata, readOnly: true },
      };

      const { result } = mountComposable(props);
      
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(result.fieldIsEditableByUser.value).toBe(false);
    });

    it("should correctly determine permissions for viewing with negative result", async () => {
      const props = {
        ...defaultProps,
        metadata: { ...defaultProps.metadata, permitted: false },
      };

      const { result } = mountComposable(props);
      
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(result.fieldIsPermittedToBeSeenByUser.value).toBe(false);
    });

    it("should correctly determine permissions for viewing", async () => {
      const props = {
        ...defaultProps,
        metadata: { ...defaultProps.metadata, permitted: true },
      };

      const { result } = mountComposable(props);
      
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(result.fieldIsPermittedToBeSeenByUser.value).toBe(true);
    });

    it("should correctly determine permissions for viewing & editing", async () => {
      const props = {
        ...defaultProps,
        metadata: {
          ...defaultProps.metadata,
          permitted: true,
          readOnly: false,
        },
      };

      const { result } = mountComposable(props);
      
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(result.fieldIsPermittedToBeSeenByUser.value).toBe(true);
      expect(result.fieldIsEditableByUser.value).toBe(true);
    });

    it("should correctly determine permissions for viewing & editing with negative result", async () => {
      const props = {
        ...defaultProps,
        metadata: {
          ...defaultProps.metadata,
          permitted: false,
          readOnly: true,
        },
      };

      const { result } = mountComposable(props);
      
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(result.fieldIsPermittedToBeSeenByUser.value).toBe(false);
      expect(result.fieldIsEditableByUser.value).toBe(false);
    });
  });

 describe("Editable Fields Management", () => {
    it("should exclude a field from editableFields if the user cannot edit it", async () => {
      const fieldKey = "restrictedField";
      const formId = "form-123";
      
      const props = {
        ...defaultProps,
        formId,
        metadata: { 
          ...defaultProps.metadata, 
          key: fieldKey,
          readOnly: true,
        },
      };

      mockEditableFields.value = {
        [formId]: [fieldKey, "otherField"]
      };

      mountComposable(props);
      
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockEditableFields.value[formId]).not.toContain(fieldKey);
      expect(mockEditableFields.value[formId]).toEqual(["otherField"]);
    });

    it("should do not exclude a field from editableFields if the user can edit it", async () => {
      const fieldKey = "restrictedField";
      const formId = "form-123";
      
      const props = {
        ...defaultProps,
        formId,
        metadata: { 
          ...defaultProps.metadata, 
          key: fieldKey,
          readOnly: false,
        },
      };

      mockEditableFields.value = {
        [formId]: [fieldKey, "otherField"]
      };

      mountComposable(props);
      
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockEditableFields.value[formId]).toContain(fieldKey);
      expect(mockEditableFields.value[formId]).toEqual([fieldKey,"otherField"]);
    });
  });

  describe("Fields the graphql layer said nothing about", () => {
    // A client that selects neither flag gets a field it can see and edit,
    // which is what an unconfigured field always did.
    it("shows and allows editing a field carrying neither verdict", async () => {
      const props = {
        ...defaultProps,
        metadata: {
          key: "testField",
          label: "Test Field",
          value: "initial",
          __typename: "PanelMetaData",
        },
      };

      const { result } = mountComposable(props);

      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(result.fieldIsPermittedToBeSeenByUser.value).toBe(true);
      expect(result.fieldIsEditableByUser.value).toBe(true);
    });
  });
});