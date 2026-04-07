import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ValidationFields, ValidationRules } from "@/generated-types/queries";
import type { FieldMetadata } from "@/components/metadata/useMetadataWrapper";

vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({
    getKeyBasedOnInputField: (metadata: {
      key: string;
      inputField?: { fieldKeyToSave?: string };
    }) => metadata.inputField?.fieldKeyToSave ?? metadata.key,
  }),
}));

import { useVeeValidate } from "../useVeeValidate";

const makeMetadata = (
  overrides: Record<string, unknown> = {},
): FieldMetadata => {
  const base = {
    __typename: "PanelMetaData" as const,
    key: "testField",
    inputField: {
      type: "text",
      validation: { value: "" },
      relationType: "",
    },
    value: undefined,
    ...overrides,
  };
  return base as unknown as FieldMetadata;
};

describe("useVeeValidate", () => {
  let getVeeValidateKey: ReturnType<typeof useVeeValidate>["getVeeValidateKey"];
  let isValidationRulePresentOnField: ReturnType<
    typeof useVeeValidate
  >["isValidationRulePresentOnField"];

  beforeEach(() => {
    vi.clearAllMocks();
    const result = useVeeValidate();
    getVeeValidateKey = result.getVeeValidateKey;
    isValidationRulePresentOnField = result.isValidationRulePresentOnField;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("isValidationRulePresentOnField", () => {
    it("returns true when single rule is present in validation value", () => {
      const metadata = makeMetadata({
        inputField: { validation: { value: "required|email" } },
      });
      expect(
        isValidationRulePresentOnField({
          metadata,
          rule: ValidationRules.Required,
        }),
      ).toBe(true);
    });

    it("returns false when single rule is not present", () => {
      const metadata = makeMetadata({
        inputField: { validation: { value: "required" } },
      });
      expect(
        isValidationRulePresentOnField({
          metadata,
          rule: ValidationRules.Email,
        }),
      ).toBe(false);
    });

    it("returns true when any rule in array matches", () => {
      const metadata = makeMetadata({
        inputField: { validation: { value: "has_required_relation" } },
      });
      expect(
        isValidationRulePresentOnField({
          metadata,
          rule: [
            ValidationRules.HasRequiredRelation,
            ValidationRules.HasOneOfRequiredRelations,
          ],
        }),
      ).toBe(true);
    });

    it("returns false when no rules in array match", () => {
      const metadata = makeMetadata({
        inputField: { validation: { value: "required" } },
      });
      expect(
        isValidationRulePresentOnField({
          metadata,
          rule: [
            ValidationRules.HasRequiredRelation,
            ValidationRules.HasOneOfRequiredRelations,
          ],
        }),
      ).toBe(false);
    });

    it("returns false when validation is undefined", () => {
      const metadata = makeMetadata({
        inputField: { validation: undefined },
      });
      expect(
        isValidationRulePresentOnField({
          metadata,
          rule: ValidationRules.Required,
        }),
      ).toBe(false);
    });
  });

  describe("getVeeValidateKey", () => {
    it("returns intialValues key when inputField is missing and no linkedEntityId", () => {
      const metadata = makeMetadata({ inputField: undefined });
      const result = getVeeValidateKey({ metadata });
      expect(result).toBe(`${ValidationFields.IntialValues}.testField`);
    });

    it("returns intialValues key when field has regex validation", () => {
      const metadata = makeMetadata({
        inputField: { validation: { value: "regex" }, relationType: "" },
      });
      const result = getVeeValidateKey({ metadata });
      expect(result).toBe(`${ValidationFields.IntialValues}.testField`);
    });

    it("returns relationMetadata key for PanelRelationMetaData typename", () => {
      const metadata = makeMetadata({
        __typename: "PanelRelationMetaData",
        inputField: { validation: { value: "" }, relationType: "" },
      });
      const result = getVeeValidateKey({ metadata });
      expect(result).toBe(`${ValidationFields.RelationMetadata}.testField`);
    });

    it("returns relationRootdata key for PanelRelationRootData typename", () => {
      const metadata = makeMetadata({
        __typename: "PanelRelationRootData",
        inputField: { validation: { value: "" }, relationType: "" },
      });
      const result = getVeeValidateKey({ metadata });
      expect(result).toBe(`${ValidationFields.RelationRootdata}.testField`);
    });

    it("returns intialValues key for required relations when not in edit mode", () => {
      const metadata = makeMetadata({
        inputField: {
          validation: { value: "has_required_relation" },
          relationType: "refSomeRelation",
        },
      });
      const result = getVeeValidateKey({ metadata, isEdit: false });
      expect(result).toBe(`${ValidationFields.IntialValues}.testField`);
    });

    it("returns relationValues key with relationType for required relations in edit mode", () => {
      const metadata = makeMetadata({
        inputField: {
          validation: { value: "has_required_relation" },
          relationType: "refSomeRelation",
        },
      });
      const result = getVeeValidateKey({ metadata, isEdit: true });
      expect(result).toBe(
        `${ValidationFields.RelationValues}.refSomeRelation`,
      );
    });

    it("returns intialValues key with .label suffix when field has formatter in edit mode", () => {
      const metadata = makeMetadata({
        inputField: { validation: { value: "" }, relationType: "" },
        value: { formatter: "someFormatter" },
      });
      const result = getVeeValidateKey({ metadata, isEdit: true });
      expect(result).toBe(
        `${ValidationFields.IntialValues}.testField.label`,
      );
    });

    it("returns intialValues key without .label when field has formatter but not in edit mode", () => {
      const metadata = makeMetadata({
        inputField: { validation: { value: "" }, relationType: "" },
        value: { formatter: "someFormatter" },
      });
      const result = getVeeValidateKey({ metadata, isEdit: false });
      expect(result).toBe(`${ValidationFields.IntialValues}.testField`);
    });

    it("returns intialValues key without .label when field has no formatter in edit mode", () => {
      const metadata = makeMetadata({
        inputField: { validation: { value: "" }, relationType: "" },
        value: undefined,
      });
      const result = getVeeValidateKey({ metadata, isEdit: true });
      expect(result).toBe(`${ValidationFields.IntialValues}.testField`);
    });

    it("returns intialValues key for regular inputField without special conditions", () => {
      const metadata = makeMetadata({
        inputField: { validation: { value: "" }, relationType: "" },
      });
      const result = getVeeValidateKey({ metadata });
      expect(result).toBe(`${ValidationFields.IntialValues}.testField`);
    });

    it("returns relatedEntityData key when linkedEntityId is provided and no inputField", () => {
      const metadata = makeMetadata({ inputField: undefined });
      const result = getVeeValidateKey({
        metadata,
        linkedEntityId: "entity-123",
      });
      expect(result).toBe(
        `${ValidationFields.RelatedEntityData}.testField-entity-123`,
      );
    });

    it("returns intialValues key when no inputField and no linkedEntityId", () => {
      const metadata = makeMetadata({
        inputField: undefined as unknown as FieldMetadata["inputField"],
      });
      const result = getVeeValidateKey({ metadata });
      expect(result).toBe(`${ValidationFields.IntialValues}.testField`);
    });

    it("appends linkedEntityId to base key when provided", () => {
      const metadata = makeMetadata({
        inputField: { validation: { value: "" }, relationType: "" },
      });
      const result = getVeeValidateKey({
        metadata,
        linkedEntityId: "entity-456",
      });
      expect(result).toBe(
        `${ValidationFields.IntialValues}.testField-entity-456`,
      );
    });

    it("uses fieldKeyToSave for base key when available", () => {
      const metadata = makeMetadata({
        inputField: {
          fieldKeyToSave: "customKey",
          validation: { value: "" },
          relationType: "",
        },
      });
      const result = getVeeValidateKey({ metadata });
      expect(result).toBe(`${ValidationFields.IntialValues}.customKey`);
    });

    it("uses repeatable panel config for base key when repeatable", () => {
      const metadata = makeMetadata({
        inputField: { validation: { value: "" }, relationType: "" },
      });
      const repeatablePanelConfig = {
        isRepeatable: true,
        index: 2,
        field: undefined,
        repeatableFieldsHelper: { fieldKey: "panelKey" },
      };
      const result = getVeeValidateKey({
        metadata,
        repeatablePanelConfig: repeatablePanelConfig as any,
      });
      expect(result).toBe(
        `${ValidationFields.IntialValues}.repeatable-panels.panelKey[2].testField`,
      );
    });
  });
});
