import { describe, it, expect } from "vitest";
import { toRepetitiveFormConfig } from "@/composables/useRepetitiveFlowConfig";
import { Entitytyping } from "@/generated-types/queries";
import type { RepetitiveFormConfig } from "@/composables/useRepetitiveForm";

// Raw object shaped like the omnibus config but sprinkled with __typename at
// every level: top-level, inside a step, inside scopeToRelationOf, inside a
// relation, and inside finalize.
const rawWithTypenames = {
  __typename: "RepetitiveFormConfig",
  repeatable: true,
  steps: [
    {
      __typename: "RepetitiveStepConfig",
      key: "work",
      entityType: Entitytyping.Work,
      createForm: "GetWorkCreationForm",
      acceptedTypes: [Entitytyping.Work],
      pickerQuery: "GetWorksForPicker",
      pickerFiltersQuery: "GetWorksForPickerFilters",
    },
    {
      __typename: "RepetitiveStepConfig",
      key: "expression",
      entityType: Entitytyping.Expression,
      createForm: "basicCreateExpressionFields",
      scopeToRelationOf: {
        __typename: "StepScopeConfig",
        step: "work",
        relationType: "refWork",
      },
      skipSearchIfPriorIsNew: true,
      relations: [
        {
          __typename: "StepRelationConfig",
          to: "work",
          relationType: "refWork",
          createWhen: "onCreate",
        },
      ],
    },
  ],
  finalize: {
    __typename: "RepetitiveFinalizeConfig",
    entityType: Entitytyping.Manifestation,
    createForm: "basicCreateManifestationFields",
    relations: [
      {
        __typename: "FinalizeRelationConfig",
        toAllOf: "expression",
        relationType: "refExpressions",
        createWhen: "onFinalize",
      },
    ],
  },
};

const expectedClean: RepetitiveFormConfig = {
  repeatable: true,
  steps: [
    {
      key: "work",
      entityType: Entitytyping.Work,
      createForm: "GetWorkCreationForm",
      acceptedTypes: [Entitytyping.Work],
      pickerQuery: "GetWorksForPicker",
      pickerFiltersQuery: "GetWorksForPickerFilters",
    },
    {
      key: "expression",
      entityType: Entitytyping.Expression,
      createForm: "basicCreateExpressionFields",
      scopeToRelationOf: {
        step: "work",
        relationType: "refWork",
      },
      skipSearchIfPriorIsNew: true,
      relations: [
        {
          to: "work",
          relationType: "refWork",
          createWhen: "onCreate",
        },
      ],
    },
  ],
  finalize: {
    entityType: Entitytyping.Manifestation,
    createForm: "basicCreateManifestationFields",
    relations: [
      {
        toAllOf: "expression",
        relationType: "refExpressions",
        createWhen: "onFinalize",
      },
    ],
  },
};

describe("toRepetitiveFormConfig", () => {
  it("removes __typename from the top-level object", () => {
    const result = toRepetitiveFormConfig(rawWithTypenames);
    expect(result).not.toHaveProperty("__typename");
  });

  it("removes __typename from each step", () => {
    const result = toRepetitiveFormConfig(rawWithTypenames);
    result.steps.forEach((step) => {
      expect(step).not.toHaveProperty("__typename");
    });
  });

  it("removes __typename from scopeToRelationOf inside a step", () => {
    const result = toRepetitiveFormConfig(rawWithTypenames);
    const stepWithScope = result.steps.find((s) => s.scopeToRelationOf);
    expect(stepWithScope?.scopeToRelationOf).not.toHaveProperty("__typename");
  });

  it("removes __typename from relations inside a step", () => {
    const result = toRepetitiveFormConfig(rawWithTypenames);
    const stepWithRelations = result.steps.find(
      (s) => s.relations && s.relations.length > 0,
    );
    stepWithRelations?.relations?.forEach((rel) => {
      expect(rel).not.toHaveProperty("__typename");
    });
  });

  it("removes __typename from the finalize config", () => {
    const result = toRepetitiveFormConfig(rawWithTypenames);
    expect(result.finalize).not.toHaveProperty("__typename");
  });

  it("removes __typename from relations inside finalize", () => {
    const result = toRepetitiveFormConfig(rawWithTypenames);
    result.finalize?.relations.forEach((rel) => {
      expect(rel).not.toHaveProperty("__typename");
    });
  });

  it("deep-equals the expected clean config after stripping", () => {
    const result = toRepetitiveFormConfig(rawWithTypenames);
    expect(result).toEqual(expectedClean);
  });

  it("leaves a config without __typename fields unchanged", () => {
    const result = toRepetitiveFormConfig(expectedClean);
    expect(result).toEqual(expectedClean);
  });
});
