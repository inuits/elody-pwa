import { describe, it, expect, vi, beforeEach } from "vitest";
import { useMetadataWrapper } from "../../components/metadata/useMetadataWrapper";
import { ref, nextTick, defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";
import { getEntityIdFromRoute } from "@/helpers";

const mockFetchAdvancedPermissions = vi.fn();
const mockSetExtraVariables = vi.fn();
const mockEditableFields = ref<Record<string, string[]>>({});

const mocks = vi.hoisted(() => {
  return {
    getForm: vi.fn(),
    getEntityIdFromRoute: vi.fn(),
  };
});

vi.mock("@/composables/usePermissions", () => ({
  usePermissions: () => ({
    fetchAdvancedPermissions: mockFetchAdvancedPermissions,
    setExtraVariables: mockSetExtraVariables,
  }),
}));

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
      can: [] as string[],
      canEdit: [] as string[],
      value: "initial",
      __typename: "PanelMetaData",
    },
    formId: "form-123",
    isEdit: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockEditableFields.value = { "form-123": ["testField"] };
    // Default mock response: all permissions granted
    mockFetchAdvancedPermissions.mockResolvedValue({});
  });

describe("Permissions for displaying & editing", () => {
    it("should allow everything if no permissions are defined in metadata", async () => {
      const { result } = mountComposable(defaultProps);

      await nextTick(); 
      await new Promise(resolve => setTimeout(resolve, 0)); 

      expect(result.fieldIsPermittedToBeSeenByUser.value).toBe(true);
      expect(result.fieldIsEditableByUser.value).toBe(true);
    });

    it("should correctly determine permissions for editing", async () => {
      const props = {
        ...defaultProps,
        metadata: { ...defaultProps.metadata, canEdit: ["perm_edit"] },
      };

      mockFetchAdvancedPermissions.mockResolvedValue({ perm_edit: true });

      const { result } = mountComposable(props);
      
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(result.fieldIsEditableByUser.value).toBe(true);
    });

    it("should correctly determine permissions for editing with negative result", async () => {
      const props = {
        ...defaultProps,
        metadata: { ...defaultProps.metadata, canEdit: ["perm_edit"] },
      };

      mockFetchAdvancedPermissions.mockResolvedValue({ perm_edit: false });

      const { result } = mountComposable(props);
      
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(result.fieldIsEditableByUser.value).toBe(false);
    });

    it("should correctly determine permissions for viewing with negative result", async () => {
      const props = {
        ...defaultProps,
        metadata: { ...defaultProps.metadata, can: ["perm_view"] },
      };

      mockFetchAdvancedPermissions.mockResolvedValue({ perm_view: false });

      const { result } = mountComposable(props);
      
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(result.fieldIsPermittedToBeSeenByUser.value).toBe(false);
    });

    it("should correctly determine permissions for viewing", async () => {
      const props = {
        ...defaultProps,
        metadata: { ...defaultProps.metadata, can: ["perm_view"] },
      };

      mockFetchAdvancedPermissions.mockResolvedValue({ perm_view: true });

      const { result } = mountComposable(props);
      
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(result.fieldIsPermittedToBeSeenByUser.value).toBe(true);
    });

    it("should correctly determine permissions for viewing & editing", async () => {
      const props = {
        ...defaultProps,
        metadata: { ...defaultProps.metadata, can: ["perm_view"], canEdit: ["perm_edit"] },
      };

      mockFetchAdvancedPermissions.mockResolvedValue({ perm_view: true, perm_edit: true });

      const { result } = mountComposable(props);
      
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(result.fieldIsPermittedToBeSeenByUser.value).toBe(true);
      expect(result.fieldIsEditableByUser.value).toBe(true);
    });

    it("should correctly determine permissions for viewing & editing with negative result", async () => {
      const props = {
        ...defaultProps,
        metadata: { ...defaultProps.metadata, can: ["perm_view"], canEdit: ["perm_edit"] },
      };

      mockFetchAdvancedPermissions.mockResolvedValue({ perm_view: false, perm_edit: false });

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
          canEdit: ["restricted_permission"] 
        },
      };

      mockEditableFields.value = {
        [formId]: [fieldKey, "otherField"]
      };
      
      mockFetchAdvancedPermissions.mockResolvedValue({ restricted_permission: false });

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
          canEdit: ["restricted_permission"] 
        },
      };

      mockEditableFields.value = {
        [formId]: [fieldKey, "otherField"]
      };
      
      mockFetchAdvancedPermissions.mockResolvedValue({ restricted_permission: true });

      mountComposable(props);
      
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockEditableFields.value[formId]).toContain(fieldKey);
      expect(mockEditableFields.value[formId]).toEqual([fieldKey,"otherField"]);
    });
  });

  describe("Variable Initialization", () => {
    it("should correctly set variables for permissions on init and update", async () => {
      const {  } = useMetadataWrapper(defaultProps as any);

      expect(mockSetExtraVariables).toHaveBeenCalledWith({
        parentEntityId: "form-123",
        childEntityId: "",
      });
    });
  });
});