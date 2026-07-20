import { describe, it, expect } from "vitest";
import { toRepetitiveFormConfig } from "@/composables/useRepetitiveFlowConfig";

// Raw object shaped like the real GetRepetitiveFormForOmnibus response:
// the self-describing query aliases each `steps` field (work / expression),
// so steps arrive as separate single-element arrays in query-field order,
// sprinkled with __typename at every level. Optional inputs that were not
// provided in the query come back as "" from the echo resolvers.
const rawOmnibusResponse = {
  __typename: "RepetitiveForm",
  repeatable: true,
  work: [
    {
      __typename: "RepetitiveStep",
      key: "work",
      entityType: "work",
      createForm: "GetFullWorkWordCreateForm",
      pickerQuery: "GetRelatedWorks",
      pickerFiltersQuery: "GetGuidedFlowWorksFilters",
      acceptedTypes: ["work"],
      skipSearchIfPriorIsNew: false,
    },
  ],
  expression: [
    {
      __typename: "RepetitiveStep",
      key: "expression",
      entityType: "expression",
      createForm: "GetFullReadingCreateForm",
      pickerQuery: "GetExpressionsBlockingRelations",
      pickerFiltersQuery: "GetGuidedFlowExpressionsFilters",
      acceptedTypes: ["expression"],
      skipSearchIfPriorIsNew: false,
      scopeToRelationOf: {
        __typename: "RepetitiveStepScope",
        step: "work",
        relationType: "refWork",
        filterKey: "vlacc:1|properties.ref_work.value",
      },
      relations: [
        {
          __typename: "RepetitiveStepRelation",
          to: "work",
          relationType: "refWork",
          createWhen: "onCreate",
        },
      ],
    },
  ],
  finalize: {
    __typename: "RepetitiveFinalize",
    entityType: "manifestation",
    createForm: "GetFullManifestationWordCreateForm",
    relations: [
      {
        __typename: "RepetitiveFinalizeRelation",
        toAllOf: "expression",
        relationType: "refOmnibus",
        createWhen: "onFinalize",
      },
    ],
    prefillMetadata: [
      {
        __typename: "RepetitiveMetadataPrefill",
        key: "is_omnibus",
        value: true,
      },
    ],
  },
};

describe("toRepetitiveFormConfig", () => {
  it("flattens aliased step arrays into an ordered steps list", () => {
    const result = toRepetitiveFormConfig(rawOmnibusResponse);
    expect(result.steps.map((s) => s.key)).toEqual(["work", "expression"]);
  });

  it("does not keep the alias keys on the config", () => {
    const result = toRepetitiveFormConfig(rawOmnibusResponse);
    expect(result).not.toHaveProperty("work");
    expect(result).not.toHaveProperty("expression");
  });

  it("removes __typename at every level", () => {
    const result = toRepetitiveFormConfig(rawOmnibusResponse);
    expect(JSON.stringify(result)).not.toContain("__typename");
  });

  it("keeps step fields, scope and relations intact", () => {
    const result = toRepetitiveFormConfig(rawOmnibusResponse);
    expect(result.steps[1]).toEqual({
      key: "expression",
      entityType: "expression",
      createForm: "GetFullReadingCreateForm",
      pickerQuery: "GetExpressionsBlockingRelations",
      pickerFiltersQuery: "GetGuidedFlowExpressionsFilters",
      acceptedTypes: ["expression"],
      skipSearchIfPriorIsNew: false,
      scopeToRelationOf: {
        step: "work",
        relationType: "refWork",
        filterKey: "vlacc:1|properties.ref_work.value",
      },
      relations: [
        { to: "work", relationType: "refWork", createWhen: "onCreate" },
      ],
    });
  });

  it("keeps repeatable and the finalize config including prefillMetadata", () => {
    const result = toRepetitiveFormConfig(rawOmnibusResponse);
    expect(result.repeatable).toBe(true);
    expect(result.finalize).toEqual({
      entityType: "manifestation",
      createForm: "GetFullManifestationWordCreateForm",
      relations: [
        {
          toAllOf: "expression",
          relationType: "refOmnibus",
          createWhen: "onFinalize",
        },
      ],
      prefillMetadata: [{ key: "is_omnibus", value: true }],
    });
  });

  it("drops optional inputs the echo resolvers return as empty strings", () => {
    const result = toRepetitiveFormConfig({
      repeatable: false,
      work: [
        {
          key: "work",
          entityType: "work",
          createForm: "GetWorkForm",
          pickerQuery: "",
          pickerFiltersQuery: "",
          scopeToRelationOf: {
            step: "prior",
            relationType: "refPrior",
            filterKey: "",
          },
        },
      ],
    });
    const step = result.steps[0];
    expect(step.pickerQuery).toBeUndefined();
    expect(step.pickerFiltersQuery).toBeUndefined();
    expect(step.scopeToRelationOf?.filterKey).toBeUndefined();
    expect(step.scopeToRelationOf?.relationType).toBe("refPrior");
  });

  it("keeps configured labels and drops empty ones", () => {
    const result = toRepetitiveFormConfig({
      label: "repetitiveForm.omnibus-title",
      repeatable: true,
      work: [
        {
          key: "work",
          label: "repetitiveForm.step-work",
          entityType: "work",
          createForm: "GetWorkForm",
        },
        { key: "expression", label: "", entityType: "expression", createForm: "GetExprForm" },
      ],
      finalize: {
        label: "repetitiveForm.finalize-omnibus",
        entityType: "manifestation",
        createForm: "GetManifForm",
        relations: [],
      },
    });
    expect(result.label).toBe("repetitiveForm.omnibus-title");
    expect(result.steps[0].label).toBe("repetitiveForm.step-work");
    expect(result.steps[1].label).toBeUndefined();
    expect(result.finalize?.label).toBe("repetitiveForm.finalize-omnibus");
  });

  it("keeps configured overviewFields and drops the empty echo default", () => {
    const result = toRepetitiveFormConfig({
      repeatable: true,
      work: [
        {
          key: "work",
          entityType: "work",
          createForm: "GetWorkForm",
          overviewFields: [
            { key: "original_headtitle", label: "metadata.labels.headtitle" },
            { key: "refLanguages", label: "metadata.labels.original-language" },
          ],
        },
      ],
      expression: [
        {
          key: "expression",
          entityType: "expression",
          createForm: "GetExprForm",
          overviewFields: [],
        },
      ],
    });
    expect(result.steps[0].overviewFields).toEqual([
      { key: "original_headtitle", label: "metadata.labels.headtitle" },
      { key: "refLanguages", label: "metadata.labels.original-language" },
    ]);
    expect(result.steps[1].overviewFields).toBeUndefined();
  });

  it("keeps configured creatableTypes on steps and finalize, drops empty ones", () => {
    const result = toRepetitiveFormConfig({
      repeatable: true,
      work: [
        {
          key: "work",
          entityType: "work",
          createForm: "GetWorkForm",
          creatableTypes: [
            {
              label: "entity-translations.singular.work_word",
              entityType: "work_word",
              createForm: "GetFullWorkWordCreateForm",
            },
            {
              label: "entity-translations.singular.work_serial",
              entityType: "work_serial",
              createForm: "GetFullWorkSerialCreateForm",
            },
          ],
        },
      ],
      expression: [
        {
          key: "expression",
          entityType: "expression",
          createForm: "GetExprForm",
          creatableTypes: [],
        },
      ],
      finalize: {
        entityType: "manifestation",
        createForm: "GetManifForm",
        relations: [],
        creatableTypes: [
          {
            label: "entity-translations.singular.manifestation_word",
            entityType: "manifestation_word",
            createForm: "GetBasicManifestationWordCreateForm",
          },
        ],
      },
    });
    expect(result.steps[0].creatableTypes).toEqual([
      {
        label: "entity-translations.singular.work_word",
        entityType: "work_word",
        createForm: "GetFullWorkWordCreateForm",
      },
      {
        label: "entity-translations.singular.work_serial",
        entityType: "work_serial",
        createForm: "GetFullWorkSerialCreateForm",
      },
    ]);
    expect(result.steps[1].creatableTypes).toBeUndefined();
    expect(result.finalize?.creatableTypes).toEqual([
      {
        label: "entity-translations.singular.manifestation_word",
        entityType: "manifestation_word",
        createForm: "GetBasicManifestationWordCreateForm",
      },
    ]);
  });

  it("keeps a positive maxSelection and drops the no-limit value 0", () => {
    const result = toRepetitiveFormConfig({
      repeatable: true,
      work: [
        {
          key: "work",
          entityType: "work",
          createForm: "GetWorkForm",
          maxSelection: 1,
        },
      ],
      expression: [
        {
          key: "expression",
          entityType: "expression",
          createForm: "GetExprForm",
          maxSelection: 0,
        },
      ],
    });
    expect(result.steps[0].maxSelection).toBe(1);
    expect(result.steps[1].maxSelection).toBeUndefined();
  });

  it("supports a flow without finalize", () => {
    const result = toRepetitiveFormConfig({
      repeatable: false,
      work: [{ key: "work", entityType: "work", createForm: "GetWorkForm" }],
    });
    expect(result.finalize).toBeUndefined();
    expect(result.steps).toHaveLength(1);
  });

  it("returns a safe empty config for a null result", () => {
    expect(toRepetitiveFormConfig(null)).toEqual({
      repeatable: false,
      steps: [],
    });
  });

  it("carries linear and routeToStep from the raw response", () => {
    const config = toRepetitiveFormConfig({
      __typename: "RepetitiveForm",
      repeatable: false,
      linear: true,
      routeToStep: "work",
      work: [{ __typename: "RepetitiveStep", key: "work", entityType: "work", createForm: "GetWorkForm" }],
    });
    expect(config.linear).toBe(true);
    expect(config.routeToStep).toBe("work");
  });

  it("defaults linear to false and drops an empty routeToStep echo", () => {
    const config = toRepetitiveFormConfig({
      __typename: "RepetitiveForm",
      repeatable: false,
      linear: false,
      routeToStep: "",
      work: [{ __typename: "RepetitiveStep", key: "work", entityType: "work", createForm: "GetWorkForm" }],
    });
    expect(config.linear).toBe(false);
    expect(config.routeToStep).toBeUndefined();
  });

  it("carries a finalizeOnHost terminal (stripping __typename)", () => {
    const config = toRepetitiveFormConfig({
      __typename: "RepetitiveForm",
      repeatable: false,
      linear: true,
      work: [
        { __typename: "RepetitiveStep", key: "work", entityType: "work" },
      ],
      finalizeOnHost: {
        __typename: "RepetitiveHostFinalize",
        fromStep: "expression",
        relationType: "refExpressions",
        replaceExisting: true,
      },
    });
    expect(config.finalizeOnHost).toEqual({
      fromStep: "expression",
      relationType: "refExpressions",
      replaceExisting: true,
    });
  });

  it("drops an unused finalizeOnHost echo (empty fromStep/relationType)", () => {
    const config = toRepetitiveFormConfig({
      __typename: "RepetitiveForm",
      repeatable: false,
      work: [
        { __typename: "RepetitiveStep", key: "work", entityType: "work" },
      ],
      finalizeOnHost: {
        __typename: "RepetitiveHostFinalize",
        fromStep: "",
        relationType: "",
        replaceExisting: false,
      },
    });
    expect(config.finalizeOnHost).toBeUndefined();
  });
});
