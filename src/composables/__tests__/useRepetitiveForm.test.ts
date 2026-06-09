import { describe, it, expect, beforeEach, vi } from "vitest";
import { Entitytyping } from "@/generated-types/queries";
import {
  useRepetitiveForm,
  type RepetitiveFormConfig,
} from "@/composables/useRepetitiveForm";

const mocks = vi.hoisted(() => ({
  createEntity: vi.fn(),
}));

vi.mock("@/composables/useManageEntities", () => ({
  useManageEntities: () => ({ createEntity: mocks.createEntity }),
}));

const omnibusConfig = (): RepetitiveFormConfig => ({
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
      scopeToRelationOf: { step: "work", relationType: "refWork" },
      skipSearchIfPriorIsNew: true,
      relations: [{ to: "work", relationType: "refWork", createWhen: "onCreate" }],
    },
  ],
  finalize: {
    entityType: Entitytyping.Manifestation,
    createForm: "basicCreateManifestationFields",
    relations: [
      { toAllOf: "expression", relationType: "refExpressions", createWhen: "onFinalize" },
    ],
  },
});

describe("useRepetitiveForm", () => {
  beforeEach(() => {
    useRepetitiveForm().resetFlow();
    mocks.createEntity.mockReset();
  });

  it("has empty state before a flow is initialised", () => {
    const { flowConfig, branches, currentStepIndex, currentBranch } = useRepetitiveForm();
    expect(flowConfig.value).toBeNull();
    expect(branches.value).toEqual([]);
    expect(currentStepIndex.value).toBe(0);
    expect(currentBranch.value).toEqual({ entities: {} });
  });

  it("initFlow stores the config", () => {
    const { initFlow, flowConfig } = useRepetitiveForm();
    const config = omnibusConfig();
    initFlow(config);
    expect(flowConfig.value).toEqual(config);
  });

  it("shares state across separate calls (singleton)", () => {
    const first = useRepetitiveForm();
    const second = useRepetitiveForm();
    first.initFlow(omnibusConfig());
    expect(second.flowConfig.value).not.toBeNull();
  });

  it("activeStep returns the current step config", () => {
    const { initFlow, activeStep } = useRepetitiveForm();
    initFlow(omnibusConfig());
    expect(activeStep()?.key).toBe("work");
  });

  it("isLastStep is false on the first of two steps", () => {
    const { initFlow, isLastStep } = useRepetitiveForm();
    initFlow(omnibusConfig());
    expect(isLastStep()).toBe(false);
  });

  it("canCompleteStep is false until the active step has an entity", () => {
    const { initFlow, canCompleteStep } = useRepetitiveForm();
    initFlow(omnibusConfig());
    expect(canCompleteStep()).toBe(false);
  });

  it("completeStep does not advance when the step has no entity", () => {
    const { initFlow, completeStep, currentStepIndex } = useRepetitiveForm();
    initFlow(omnibusConfig());
    completeStep();
    expect(currentStepIndex.value).toBe(0);
  });

  it("pickExisting records a selected entity under the active step key", () => {
    const { initFlow, pickExisting, currentBranch } = useRepetitiveForm();
    initFlow(omnibusConfig());
    pickExisting({ id: "work-1", label: "Harry Potter" });
    expect(currentBranch.value.entities.work).toEqual({
      key: "work",
      id: "work-1",
      type: Entitytyping.Work,
      label: "Harry Potter",
      isNew: false,
    });
  });

  it("canCompleteStep is true after an entity is picked", () => {
    const { initFlow, pickExisting, canCompleteStep } = useRepetitiveForm();
    initFlow(omnibusConfig());
    pickExisting({ id: "work-1" });
    expect(canCompleteStep()).toBe(true);
  });

  it("completeStep advances after picking on a non-last step", () => {
    const { initFlow, pickExisting, completeStep, currentStepIndex } =
      useRepetitiveForm();
    initFlow(omnibusConfig());
    pickExisting({ id: "work-1" });
    completeStep();
    expect(currentStepIndex.value).toBe(1);
  });

  it("buildScopeFilter returns null for a step with no scope config", () => {
    const { initFlow, buildScopeFilter, activeStep } = useRepetitiveForm();
    initFlow(omnibusConfig());
    expect(buildScopeFilter(activeStep()!)).toBeNull();
  });

  it("buildScopeFilter scopes the search to the prior step's entity id", () => {
    const { initFlow, pickExisting, completeStep, activeStep, buildScopeFilter } =
      useRepetitiveForm();
    initFlow(omnibusConfig());
    pickExisting({ id: "work-1" });
    completeStep(); // now on expression step
    expect(buildScopeFilter(activeStep()!)).toEqual({
      type: "selection",
      key: ["elody:1|relations.refWork.key"],
      value: ["work-1"],
      match_exact: true,
    });
  });

  it("shouldSkipSearch is true when the scoped prior entity was newly created", () => {
    const { initFlow, recordEntity, completeStep, activeStep, shouldSkipSearch } =
      useRepetitiveForm();
    initFlow(omnibusConfig());
    recordEntity({ key: "work", id: "work-9", type: Entitytyping.Work, isNew: true });
    completeStep(); // expression step
    expect(shouldSkipSearch(activeStep()!)).toBe(true);
  });

  it("shouldSkipSearch is false when the scoped prior entity already existed", () => {
    const { initFlow, pickExisting, completeStep, activeStep, shouldSkipSearch } =
      useRepetitiveForm();
    initFlow(omnibusConfig());
    pickExisting({ id: "work-1" }); // existing → isNew false
    completeStep();
    expect(shouldSkipSearch(activeStep()!)).toBe(false);
  });

  it("buildCreateRelations links to the prior step for onCreate relations", () => {
    const { initFlow, pickExisting, completeStep, activeStep, buildCreateRelations } =
      useRepetitiveForm();
    initFlow(omnibusConfig());
    pickExisting({ id: "work-1" });
    completeStep(); // expression step
    expect(buildCreateRelations(activeStep()!)).toEqual([
      { key: "work-1", type: "refWork", editStatus: "new" },
    ]);
  });

  it("buildCreateRelations is empty for a step with no relations", () => {
    const { initFlow, activeStep, buildCreateRelations } = useRepetitiveForm();
    initFlow(omnibusConfig());
    expect(buildCreateRelations(activeStep()!)).toEqual([]);
  });

  it("createForStep persists the entity with metadata and relations, then records it", async () => {
    mocks.createEntity.mockResolvedValue({ id: "expr-1", uuid: "expr-1" });
    const { initFlow, pickExisting, completeStep, activeStep, createForStep, currentBranch } =
      useRepetitiveForm();
    initFlow(omnibusConfig());
    pickExisting({ id: "work-1" });
    completeStep(); // expression step
    const result = await createForStep(activeStep()!, [
      { key: "title", value: "Chamber of Secrets" },
    ]);
    expect(mocks.createEntity).toHaveBeenCalledWith({
      entityType: Entitytyping.Expression,
      metadata: [{ key: "title", value: "Chamber of Secrets" }],
      relations: [{ key: "work-1", type: "refWork", editStatus: "new" }],
    });
    expect(result.id).toBe("expr-1");
    expect(currentBranch.value.entities.expression).toEqual({
      key: "expression",
      id: "expr-1",
      type: Entitytyping.Expression,
      label: undefined,
      isNew: true,
    });
  });

  it("completeStep on the last step pushes the branch and resets to step 0", () => {
    const { initFlow, pickExisting, completeStep, branches, currentStepIndex, currentBranch } =
      useRepetitiveForm();
    initFlow(omnibusConfig());

    pickExisting({ id: "work-1" });
    completeStep(); // → expression step
    pickExisting({ id: "expr-1" });
    completeStep(); // last step → finish branch

    expect(branches.value).toHaveLength(1);
    expect(branches.value[0].entities.work.id).toBe("work-1");
    expect(branches.value[0].entities.expression.id).toBe("expr-1");
    expect(currentStepIndex.value).toBe(0);
    expect(currentBranch.value.entities).toEqual({});
  });

  it("startNewBranch resets the current branch and step index", () => {
    const { initFlow, pickExisting, startNewBranch, currentBranch, currentStepIndex } =
      useRepetitiveForm();
    initFlow(omnibusConfig());
    pickExisting({ id: "work-1" });
    startNewBranch();
    expect(currentBranch.value.entities).toEqual({});
    expect(currentStepIndex.value).toBe(0);
  });

  const buildTwoBranches = () => {
    const store = useRepetitiveForm();
    store.initFlow(omnibusConfig());
    store.pickExisting({ id: "work-1" });
    store.completeStep();
    store.pickExisting({ id: "expr-1" });
    store.completeStep(); // branch 1 done
    store.pickExisting({ id: "work-2" });
    store.completeStep();
    store.pickExisting({ id: "expr-2" });
    store.completeStep(); // branch 2 done
    return store;
  };

  it("collectedFor returns every staged entity for a step key across branches", () => {
    const { collectedFor } = buildTwoBranches();
    expect(collectedFor("expression").map((entity) => entity.id)).toEqual([
      "expr-1",
      "expr-2",
    ]);
  });

  it("buildFinalizeRelations links the container to all collected expressions", () => {
    const { buildFinalizeRelations } = buildTwoBranches();
    expect(buildFinalizeRelations()).toEqual([
      { key: "expr-1", type: "refExpressions", editStatus: "new" },
      { key: "expr-2", type: "refExpressions", editStatus: "new" },
    ]);
  });

  it("a step carries its picker query config", () => {
    const { initFlow, activeStep } = useRepetitiveForm();
    initFlow(omnibusConfig());
    expect(activeStep()?.pickerQuery).toBe("GetWorksForPicker");
    expect(activeStep()?.acceptedTypes).toEqual([Entitytyping.Work]);
  });

  it("finalize creates the container entity with the collected relations", async () => {
    mocks.createEntity.mockResolvedValue({ id: "manif-1", uuid: "manif-1" });
    const { finalize } = buildTwoBranches();
    const result = await finalize([{ key: "is_omnibus", value: true }]);
    expect(mocks.createEntity).toHaveBeenCalledWith({
      entityType: Entitytyping.Manifestation,
      metadata: [{ key: "is_omnibus", value: true }],
      relations: [
        { key: "expr-1", type: "refExpressions", editStatus: "new" },
        { key: "expr-2", type: "refExpressions", editStatus: "new" },
      ],
    });
    expect(result.id).toBe("manif-1");
  });

  it("recordCreated records a created entity under the active step with isNew true", () => {
    const { initFlow, pickExisting, completeStep, recordCreated, currentBranch } =
      useRepetitiveForm();
    initFlow(omnibusConfig());
    pickExisting({ id: "work-1" });
    completeStep(); // expression step
    recordCreated({ id: "expr-1", label: "Chamber of Secrets" });
    expect(currentBranch.value.entities.expression).toEqual({
      key: "expression",
      id: "expr-1",
      type: Entitytyping.Expression,
      label: "Chamber of Secrets",
      isNew: true,
    });
  });

  it("recordCreated falls back to uuid when id is absent", () => {
    const { initFlow, recordCreated, currentBranch } = useRepetitiveForm();
    initFlow(omnibusConfig());
    recordCreated({ uuid: "work-9" });
    expect(currentBranch.value.entities.work.id).toBe("work-9");
    expect(currentBranch.value.entities.work.isNew).toBe(true);
  });

  it("buildCreatePrefill groups onCreate relations into relationValues", () => {
    const { initFlow, pickExisting, completeStep, activeStep, buildCreatePrefill } =
      useRepetitiveForm();
    initFlow(omnibusConfig());
    pickExisting({ id: "work-1" });
    completeStep(); // expression step
    expect(buildCreatePrefill(activeStep()!)).toEqual({
      relationValues: {
        refWork: [{ key: "work-1", type: "refWork", editStatus: "new" }],
      },
    });
  });

  it("buildCreatePrefill returns empty relationValues for a step with no relations", () => {
    const { initFlow, activeStep, buildCreatePrefill } = useRepetitiveForm();
    initFlow(omnibusConfig());
    expect(buildCreatePrefill(activeStep()!)).toEqual({ relationValues: {} });
  });

  it("buildFinalizePrefill groups finalize relations into relationValues", () => {
    const { buildFinalizePrefill } = buildTwoBranches();
    expect(buildFinalizePrefill()).toEqual({
      relationValues: {
        refExpressions: [
          { key: "expr-1", type: "refExpressions", editStatus: "new" },
          { key: "expr-2", type: "refExpressions", editStatus: "new" },
        ],
      },
    });
  });

  it("buildFinalizePrefill returns empty relationValues when nothing is collected", () => {
    const { initFlow, buildFinalizePrefill } = useRepetitiveForm();
    initFlow(omnibusConfig());
    expect(buildFinalizePrefill()).toEqual({ relationValues: {} });
  });
});
