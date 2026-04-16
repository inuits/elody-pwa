import { describe, it, expect, beforeEach } from "vitest";
import { ref } from "vue";
import { usePanelStatus } from "@/composables/usePanelStatus";
import { useFormHelper } from "@/composables/useFormHelper";
import { InputFieldTypes, type PanelStatus } from "@/generated-types/queries";

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

describe("usePanelStatus", () => {
  beforeEach(() => {
    createForm(FORM_ID, {
      intialValues: { completeness_status: "concept" } as any,
      relationValues: {},
    });
    editableFields.value[FORM_ID] = [];
  });

  describe("statusValue", () => {
    it("reads the current value from the form's intialValues", () => {
      const { statusValue } = usePanelStatus(ref(mockPanelStatus), ref(FORM_ID));
      expect(statusValue.value).toBe("concept");
    });

    it("returns undefined when panelStatus is null", () => {
      const { statusValue } = usePanelStatus(ref(null), ref(FORM_ID));
      expect(statusValue.value).toBeUndefined();
    });

    it("returns undefined when panelStatus is undefined", () => {
      const { statusValue } = usePanelStatus(ref(undefined), ref(FORM_ID));
      expect(statusValue.value).toBeUndefined();
    });

    it("returns undefined when the form does not exist", () => {
      const { statusValue } = usePanelStatus(ref(mockPanelStatus), ref("non-existent-form"));
      expect(statusValue.value).toBeUndefined();
    });
  });

  describe("getStatusMetadata", () => {
    it("returns a PanelMetaData object with key from statusMetadataKey", () => {
      const { getStatusMetadata } = usePanelStatus(ref(mockPanelStatus), ref(FORM_ID));
      expect(getStatusMetadata().key).toBe("completeness_status");
    });

    it("returns a PanelMetaData object with the statusInputField", () => {
      const { getStatusMetadata } = usePanelStatus(ref(mockPanelStatus), ref(FORM_ID));
      expect(getStatusMetadata().inputField).toEqual(mockPanelStatus.statusInputField);
    });

    it("returns a PanelMetaData object with the current form value", () => {
      const { getStatusMetadata } = usePanelStatus(ref(mockPanelStatus), ref(FORM_ID));
      expect(getStatusMetadata().value).toBe("concept");
    });

    it("reflects updated form values reactively", () => {
      const panelStatus = ref(mockPanelStatus);
      const { getStatusMetadata } = usePanelStatus(panelStatus, ref(FORM_ID));

      const form = useFormHelper().getForm(FORM_ID);
      form?.setFieldValue("intialValues.completeness_status", "final");

      expect(getStatusMetadata().value).toBe("final");
    });
  });

  describe("registerEditableKey", () => {
    it("adds the statusMetadataKey to editable fields", () => {
      const { registerEditableKey } = usePanelStatus(ref(mockPanelStatus), ref(FORM_ID));
      registerEditableKey();
      expect(editableFields.value[FORM_ID]).toContain("completeness_status");
    });

    it("does nothing when panelStatus is null", () => {
      const { registerEditableKey } = usePanelStatus(ref(null), ref(FORM_ID));
      registerEditableKey();
      expect(editableFields.value[FORM_ID]).not.toContain("completeness_status");
    });

    it("does nothing when panelStatus is undefined", () => {
      const { registerEditableKey } = usePanelStatus(ref(undefined), ref(FORM_ID));
      registerEditableKey();
      expect(editableFields.value[FORM_ID]).not.toContain("completeness_status");
    });
  });
});
