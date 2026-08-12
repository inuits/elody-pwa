import { describe, it, expect, beforeEach } from "vitest";
import { ref } from "vue";
import { useWindowOrPanelStatus } from "@/composables/useWindowOrPanelStatus";
import { useFormHelper } from "@/composables/useFormHelper";
import {
  InputFieldTypes,
  ValidationRules,
  type PanelStatus,
} from "@/generated-types/queries";

const { createForm, editableFields } = useFormHelper();

const FORM_ID = "test-panel-status-form";

const mockPanelStatus: PanelStatus = {
  __typename: "PanelStatus",
  statusMetadataKey: "completeness_status",
  statusInputField: {
    type: InputFieldTypes.DropdownSingleselectMetadata,
    options: [
      { label: "Concept", value: "concept", icon: null },
      { label: "Final", value: "final", icon: null },
    ],
  },
};

const mockRequiredPanelStatus: PanelStatus = {
  ...mockPanelStatus,
  statusInputField: {
    ...mockPanelStatus.statusInputField,
    validation: { value: [ValidationRules.Required] },
  },
};

describe("useWindowOrPanelStatus", () => {
  beforeEach(() => {
    createForm(FORM_ID, {
      intialValues: { completeness_status: "concept" } as any,
      relationValues: {},
    });
    editableFields.value[FORM_ID] = [];
  });

  describe("statusValue", () => {
    it("reads the current value from the form's intialValues", () => {
      const { statusValue } = useWindowOrPanelStatus(ref(mockPanelStatus), ref(FORM_ID));
      expect(statusValue.value).toBe("concept");
    });

    it("returns undefined when panelStatus is null", () => {
      const { statusValue } = useWindowOrPanelStatus(ref(null), ref(FORM_ID));
      expect(statusValue.value).toBeUndefined();
    });

    it("returns undefined when panelStatus is undefined", () => {
      const { statusValue } = useWindowOrPanelStatus(ref(undefined), ref(FORM_ID));
      expect(statusValue.value).toBeUndefined();
    });

    it("returns undefined when the form does not exist", () => {
      const { statusValue } = useWindowOrPanelStatus(ref(mockPanelStatus), ref("non-existent-form"));
      expect(statusValue.value).toBeUndefined();
    });
  });

  describe("getStatusMetadata", () => {
    it("returns a PanelMetaData object with key from statusMetadataKey", () => {
      const { getStatusMetadata } = useWindowOrPanelStatus(ref(mockPanelStatus), ref(FORM_ID));
      expect(getStatusMetadata().key).toBe("completeness_status");
    });

    it("returns a PanelMetaData object with the statusInputField", () => {
      const { getStatusMetadata } = useWindowOrPanelStatus(ref(mockPanelStatus), ref(FORM_ID));
      expect(getStatusMetadata().inputField).toEqual(mockPanelStatus.statusInputField);
    });

    it("returns a PanelMetaData object with the current form value", () => {
      const { getStatusMetadata } = useWindowOrPanelStatus(ref(mockPanelStatus), ref(FORM_ID));
      expect(getStatusMetadata().value).toBe("concept");
    });

    it("reflects updated form values reactively", () => {
      const panelStatus = ref(mockPanelStatus);
      const { getStatusMetadata } = useWindowOrPanelStatus(panelStatus, ref(FORM_ID));

      const form = useFormHelper().getForm(FORM_ID);
      form?.setFieldValue("intialValues.completeness_status", "final");

      expect(getStatusMetadata().value).toBe("final");
    });
  });

  describe("validation on the status field", () => {
    it("passes the validation configured on the status input field along", () => {
      const { getStatusMetadata } = useWindowOrPanelStatus(
        ref(mockRequiredPanelStatus),
        ref(FORM_ID),
      );
      expect(getStatusMetadata().inputField?.validation?.value).toContain(
        ValidationRules.Required,
      );
    });

    it("passes conditional validation along untouched", () => {
      const conditionalStatus: PanelStatus = {
        ...mockPanelStatus,
        statusInputField: {
          ...mockPanelStatus.statusInputField,
          validation: {
            required_if: { field: "material_type", value: "book" },
          },
        },
      };

      const { getStatusMetadata } = useWindowOrPanelStatus(
        ref(conditionalStatus),
        ref(FORM_ID),
      );
      expect(
        getStatusMetadata().inputField?.validation?.required_if,
      ).toEqual({ field: "material_type", value: "book" });
    });

    it("carries the configured label so the field title can show the validation state", () => {
      const statusWithLabel = {
        ...mockRequiredPanelStatus,
        label: "metadata.labels.status",
      };

      const { getStatusMetadata } = useWindowOrPanelStatus(
        ref(statusWithLabel as any),
        ref(FORM_ID),
      );
      expect(getStatusMetadata().label).toBe("metadata.labels.status");
    });

    it("leaves the label undefined when no label is configured", () => {
      const { getStatusMetadata } = useWindowOrPanelStatus(
        ref(mockPanelStatus),
        ref(FORM_ID),
      );
      expect(getStatusMetadata().label).toBeUndefined();
    });

    it("does not throw when the status value is missing from the form", () => {
      createForm(FORM_ID, {
        intialValues: {} as any,
        relationValues: {},
      });

      const { getStatusMetadata } = useWindowOrPanelStatus(
        ref(mockRequiredPanelStatus),
        ref(FORM_ID),
      );
      expect(() => getStatusMetadata()).not.toThrow();
      expect(getStatusMetadata().value).toBeUndefined();
      expect(getStatusMetadata().valueTranslationKey).toBeUndefined();
    });
  });

  describe("registerEditableKey", () => {
    it("adds the statusMetadataKey to editable fields", () => {
      const { registerEditableKey } = useWindowOrPanelStatus(ref(mockPanelStatus), ref(FORM_ID));
      registerEditableKey();
      expect(editableFields.value[FORM_ID]).toContain("completeness_status");
    });

    it("does nothing when panelStatus is null", () => {
      const { registerEditableKey } = useWindowOrPanelStatus(ref(null), ref(FORM_ID));
      registerEditableKey();
      expect(editableFields.value[FORM_ID]).not.toContain("completeness_status");
    });

    it("does nothing when panelStatus is undefined", () => {
      const { registerEditableKey } = useWindowOrPanelStatus(ref(undefined), ref(FORM_ID));
      registerEditableKey();
      expect(editableFields.value[FORM_ID]).not.toContain("completeness_status");
    });
  });
});
