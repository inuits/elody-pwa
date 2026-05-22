import { describe, expect, it, beforeEach } from "vitest";
import useEntityPickerModal from "@/composables/useEntityPickerModal";

describe("useEntityPickerModal", () => {
  describe("relationMetadataFromFormFields", () => {
    it("defaults to empty array", () => {
      const { getRelationMetadataFromFormFields } = useEntityPickerModal();
      expect(getRelationMetadataFromFormFields()).toEqual([]);
    });

    it("stores and retrieves configured fields", () => {
      const { setRelationMetadataFromFormFields, getRelationMetadataFromFormFields } =
        useEntityPickerModal();

      const fields = [
        { formMetadataKey: "role", relationMetadataKey: "roles" },
        { formMetadataKey: "since", relationMetadataKey: "active_since" },
      ];
      setRelationMetadataFromFormFields(fields);

      expect(getRelationMetadataFromFormFields()).toEqual(fields);
    });

    it("replaces previous value on re-set", () => {
      const { setRelationMetadataFromFormFields, getRelationMetadataFromFormFields } =
        useEntityPickerModal();

      setRelationMetadataFromFormFields([
        { formMetadataKey: "role", relationMetadataKey: "roles" },
      ]);
      setRelationMetadataFromFormFields([]);

      expect(getRelationMetadataFromFormFields()).toEqual([]);
    });
  });

  describe("dynamicFormId", () => {
    it("defaults to empty string", () => {
      const { getDynamicFormId } = useEntityPickerModal();
      expect(getDynamicFormId()).toBe("");
    });

    it("stores and retrieves the form id", () => {
      const { setDynamicFormId, getDynamicFormId } = useEntityPickerModal();

      setDynamicFormId("GetImportExistingContactPersonWithRoleQuery");
      expect(getDynamicFormId()).toBe(
        "GetImportExistingContactPersonWithRoleQuery",
      );
    });
  });
});
