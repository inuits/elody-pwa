import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  Entitytyping,
  RepetitiveRelationTrigger,
  type RepetitiveForm,
} from "@/generated-types/queries";
import {
  useRepetitiveForm,
  describePickedItem,
  describeCreatedEntity,
} from "@/composables/useRepetitiveForm";

const mocks = vi.hoisted(() => ({
  createEntity: vi.fn(),
  addRelations: vi.fn().mockResolvedValue(undefined),
  saveEntityValues: vi.fn().mockResolvedValue(undefined),
}));

const formMocks = vi.hoisted(() => ({
  getForm: vi.fn(() => ({ values: { relationValues: {} } })),
  replaceRelationsFromSameType: vi.fn(),
  addRelations: vi.fn(),
  parseFormValuesToFormInput: vi.fn(() => ({
    metadata: [],
    relations: [],
    updateOnlyRelations: true,
  })),
}));

vi.mock("@/composables/useManageEntities", () => ({
  useManageEntities: () => ({
    createEntity: mocks.createEntity,
    addRelations: mocks.addRelations,
    saveEntityValues: mocks.saveEntityValues,
  }),
}));

vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => formMocks,
}));

const omnibusConfig = (): RepetitiveForm => ({
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
      relations: [{ to: "work", relationType: "refWork", createWhen: RepetitiveRelationTrigger.OnCreate }],
    },
  ],
  finalize: {
    entityType: Entitytyping.Manifestation,
    createForm: "basicCreateManifestationFields",
    relations: [
      { toAllOf: "expression", relationType: "refExpressions", createWhen: RepetitiveRelationTrigger.OnFinalize },
    ],
  },
});

const moveExpressionConfig = (
  replaceExisting = true,
): RepetitiveForm =>
  ({
    repeatable: false,
    linear: true,
    routeToRoute: "WemOverview",
    steps: [
      { key: "work", entityType: Entitytyping.Work },
      { key: "expression", entityType: Entitytyping.Expression },
    ],
    finalizeOnHost: {
      fromStep: "expression",
      relationType: "refExpressions",
      replaceExisting,
    },
  }) as unknown as RepetitiveForm;

describe("useRepetitiveForm", () => {
  beforeEach(() => {
    useRepetitiveForm().resetFlow();
    mocks.createEntity.mockReset();
    mocks.addRelations.mockClear();
    mocks.saveEntityValues.mockClear();
    formMocks.replaceRelationsFromSameType.mockClear();
    formMocks.addRelations.mockClear();
    formMocks.parseFormValuesToFormInput.mockClear();
    formMocks.getForm.mockClear();
    formMocks.getForm.mockReturnValue({ values: { relationValues: {} } });
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

  it("buildScopeFilter uses the configured filterKey when provided", () => {
    const { initFlow, pickExisting, completeStep, activeStep, buildScopeFilter } =
      useRepetitiveForm();
    const config = omnibusConfig();
    config.steps[1].scopeToRelationOf!.filterKey =
      "vlacc:1|properties.ref_work.value";
    initFlow(config);
    pickExisting({ id: "work-1" });
    completeStep(); // now on expression step
    expect(buildScopeFilter(activeStep()!)).toEqual({
      type: "selection",
      key: ["vlacc:1|properties.ref_work.value"],
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

  it("pickExisting stores the provided details", () => {
    const { initFlow, pickExisting, currentBranch } = useRepetitiveForm();
    initFlow(omnibusConfig());
    pickExisting({
      id: "work-1",
      label: "Harry Potter",
      details: [{ label: "metadata.labels.author", value: "Rowling" }],
    });
    expect(currentBranch.value.entities.work.details).toEqual([
      { label: "metadata.labels.author", value: "Rowling" },
    ]);
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

  it("goToPreviousStep moves one step back and clamps at the first step", () => {
    const { initFlow, pickExisting, completeStep, goToPreviousStep, currentStepIndex } =
      useRepetitiveForm();
    initFlow(omnibusConfig());
    pickExisting({ id: "work-1" });
    completeStep(); // expression step
    expect(currentStepIndex.value).toBe(1);
    goToPreviousStep();
    expect(currentStepIndex.value).toBe(0);
    goToPreviousStep();
    expect(currentStepIndex.value).toBe(0);
  });

  it("removeBranch removes only the branch at the given index", () => {
    const { removeBranch, branches } = buildTwoBranches();
    removeBranch(0);
    expect(branches.value).toHaveLength(1);
    expect(branches.value[0].entities.work.id).toBe("work-2");
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
      intialValues: {},
    });
  });

  it("buildFinalizePrefill returns empty relationValues when nothing is collected", () => {
    const { initFlow, buildFinalizePrefill } = useRepetitiveForm();
    initFlow(omnibusConfig());
    expect(buildFinalizePrefill()).toEqual({
      relationValues: {},
      intialValues: {},
    });
  });

  it("buildFinalizePrefill seeds intialValues from finalize prefillMetadata", () => {
    const { initFlow, buildFinalizePrefill } = useRepetitiveForm();
    const config = omnibusConfig();
    config.finalize!.prefillMetadata = [
      { key: "is_omnibus", value: true },
      { key: "material_type", value: "boek" },
    ];
    initFlow(config);
    expect(buildFinalizePrefill()).toEqual({
      relationValues: {},
      intialValues: { is_omnibus: true, material_type: "boek" },
    });
  });

  const linearConfig = (): RepetitiveForm => ({
    repeatable: false,
    linear: true,
    routeToStep: "work",
    steps: [
      {
        key: "work",
        entityType: Entitytyping.Work,
        createForm: "GetWorkForm",
        pickerQuery: "GetWorks",
      },
      {
        key: "expression",
        entityType: Entitytyping.Expression,
        createForm: "GetExpressionForm",
        pickerQuery: "GetExpressions",
        relations: [
          { to: "work", relationType: "refWork", createWhen: RepetitiveRelationTrigger.Always },
        ],
      },
      {
        key: "manifestation",
        entityType: Entitytyping.Manifestation,
        createForm: "GetManifestationForm",
        pickerQuery: "GetManifestations",
        relations: [
          { to: "expression", relationType: "refExpressions", createWhen: RepetitiveRelationTrigger.Always },
        ],
      },
    ],
  });

  it("isLinear reflects the config flag", () => {
    const store = useRepetitiveForm();
    store.initFlow(linearConfig());
    expect(store.isLinear()).toBe(true);
    store.initFlow(omnibusConfig());
    expect(store.isLinear()).toBe(false);
  });

  it("buildCreateRelations includes 'always' relations", () => {
    const store = useRepetitiveForm();
    store.initFlow(linearConfig());
    store.pickExisting({ id: "work-1" });
    store.completeStep(); // expression step
    expect(store.buildCreateRelations(store.activeStep()!)).toEqual([
      { key: "work-1", type: "refWork", editStatus: "new" },
    ]);
  });

  it("linkOnSelect patches the picked entity's relation to the prior step", async () => {
    const store = useRepetitiveForm();
    store.initFlow(linearConfig());
    store.pickExisting({ id: "work-1" });
    store.completeStep(); // expression step
    store.pickExisting({ id: "expr-7" }); // existing expression picked at this step
    await store.linkOnSelect(store.activeStep()!);
    expect(mocks.addRelations).toHaveBeenCalledWith({
      entityId: "expr-7",
      relations: [{ key: "work-1", type: "refWork", editStatus: "new" }],
    });
  });

  it("linkOnSelect is a no-op for a step without onSelect/always relations", async () => {
    const store = useRepetitiveForm();
    store.initFlow(linearConfig());
    store.pickExisting({ id: "work-1" }); // work step has no relations
    await store.linkOnSelect(store.activeStep()!);
    expect(mocks.addRelations).not.toHaveBeenCalled();
  });

  it("linkOnSelect is a no-op when the prior entity is missing", async () => {
    const store = useRepetitiveForm();
    store.initFlow(linearConfig());
    store.currentStepIndex.value = 1; // expression step, but no work staged
    store.pickExisting({ id: "expr-7" });
    await store.linkOnSelect(store.activeStep()!);
    expect(mocks.addRelations).not.toHaveBeenCalled();
  });

  it("linkAfterCreate links a created entity's onCreate/always relations to the prior step", async () => {
    const store = useRepetitiveForm();
    store.initFlow(linearConfig());
    store.pickExisting({ id: "work-1" });
    store.completeStep(); // expression step
    store.recordCreated({ id: "expr-9" }); // newly created expression
    await store.linkAfterCreate(store.activeStep()!);
    expect(mocks.addRelations).toHaveBeenCalledWith({
      entityId: "expr-9",
      relations: [{ key: "work-1", type: "refWork", editStatus: "new" }],
    });
  });

  it("routeTarget returns the configured step's staged entity", () => {
    const store = useRepetitiveForm();
    store.initFlow(linearConfig());
    store.pickExisting({ id: "work-1" });
    store.completeStep();
    store.pickExisting({ id: "expr-1" });
    store.completeStep();
    store.pickExisting({ id: "manif-1" });
    expect(store.routeTarget()).toMatchObject({ id: "work-1", type: Entitytyping.Work });
  });

  it("routeTarget falls back to the last staged step when routeToStep is unset", () => {
    const store = useRepetitiveForm();
    const config = linearConfig();
    delete config.routeToStep;
    store.initFlow(config);
    store.pickExisting({ id: "work-1" });
    store.completeStep();
    store.pickExisting({ id: "expr-1" });
    expect(store.routeTarget()).toMatchObject({ id: "expr-1" });
  });

  it("finalizeOnHost swaps the relation on the host form and saves the full form input", async () => {
    const store = useRepetitiveForm();
    store.initFlow(moveExpressionConfig(true));
    store.recordEntity({
      key: "expression",
      id: "E-new",
      type: Entitytyping.Expression,
      isNew: false,
    });
    const target = await store.finalizeOnHost("M-host");
    expect(formMocks.replaceRelationsFromSameType).toHaveBeenCalledWith(
      [{ id: "E-new" }],
      "refExpressions",
      "M-host",
    );
    expect(formMocks.parseFormValuesToFormInput).toHaveBeenCalledWith(
      "M-host",
      { relationValues: {} },
      true,
    );
    expect(mocks.saveEntityValues).toHaveBeenCalledWith("M-host", {
      metadata: [],
      relations: [],
      updateOnlyRelations: true,
    });
    expect(target).toEqual({ id: "M-host" });
  });

  it("finalizeOnHost appends (does not replace) when replaceExisting is false", async () => {
    const store = useRepetitiveForm();
    store.initFlow(moveExpressionConfig(false));
    store.recordEntity({
      key: "expression",
      id: "E-new",
      type: Entitytyping.Expression,
      isNew: false,
    });
    await store.finalizeOnHost("M-host");
    expect(formMocks.addRelations).toHaveBeenCalledWith(
      [{ id: "E-new" }],
      "refExpressions",
      "M-host",
      true,
    );
    expect(formMocks.replaceRelationsFromSameType).not.toHaveBeenCalled();
    expect(mocks.saveEntityValues).toHaveBeenCalled();
  });

  it("finalizeOnHost is a no-op when the fromStep entity is not staged", async () => {
    const store = useRepetitiveForm();
    store.initFlow(moveExpressionConfig(true));
    const target = await store.finalizeOnHost("M-host");
    expect(mocks.saveEntityValues).not.toHaveBeenCalled();
    expect(target).toBeNull();
  });

  it("finalizeOnHost is a no-op without a host id", async () => {
    const store = useRepetitiveForm();
    store.initFlow(moveExpressionConfig(true));
    store.recordEntity({
      key: "expression",
      id: "E-new",
      type: Entitytyping.Expression,
      isNew: false,
    });
    const target = await store.finalizeOnHost(undefined);
    expect(mocks.saveEntityValues).not.toHaveBeenCalled();
    expect(target).toBeNull();
  });

  it("finalizeOnHost is a no-op when the host form is not loaded", async () => {
    const store = useRepetitiveForm();
    store.initFlow(moveExpressionConfig(true));
    store.recordEntity({
      key: "expression",
      id: "E-new",
      type: Entitytyping.Expression,
      isNew: false,
    });
    formMocks.getForm.mockReturnValueOnce(undefined as any);
    const target = await store.finalizeOnHost("M-host");
    expect(mocks.saveEntityValues).not.toHaveBeenCalled();
    expect(target).toBeNull();
  });
});

// teaserMetadata entries carry { label, key }; the matching display values
// live under the same key in the item's intialValues
describe("describePickedItem", () => {
  const item = {
    id: "expr-1",
    type: "reading",
    teaserMetadata: [
      { label: "metadata.labels.title", key: "computed_title" },
      { label: "metadata.labels.record-type", key: "record_type" },
      { label: "metadata.labels.language", key: "refLanguages" },
      { key: "thumbnail" }, // no label → not displayable
      null,
    ],
    intialValues: {
      computed_title: "Harry Potter",
      record_type: "tekst",
      refLanguages: ["Nederlands", "Engels"],
      thumbnail: "x.jpg",
    },
  };

  it("uses the title-ish teaser value as label and the rest as details", () => {
    expect(describePickedItem(item)).toEqual({
      label: "Harry Potter",
      details: [
        { label: "metadata.labels.record-type", value: "tekst" },
        { label: "metadata.labels.language", value: "Nederlands, Engels" },
      ],
    });
  });

  it("falls back to the item's own value when teaser data is absent", () => {
    expect(describePickedItem({ id: "x", value: "Some label" })).toEqual({
      label: "Some label",
      details: [],
    });
  });

  it("skips teaser entries whose value is missing from intialValues", () => {
    expect(
      describePickedItem({
        id: "x",
        teaserMetadata: [{ label: "metadata.labels.author", key: "refAuthors" }],
        intialValues: {},
      }),
    ).toEqual({ label: undefined, details: [] });
  });

  it("promotes the first entry to label when no entry is title-ish", () => {
    expect(
      describePickedItem({
        id: "x",
        teaserMetadata: [
          { label: "metadata.labels.name", key: "name" },
          { label: "metadata.labels.record-type", key: "record_type" },
        ],
        intialValues: { name: "Rowling", record_type: "persoon" },
      }),
    ).toEqual({
      label: "Rowling",
      details: [{ label: "metadata.labels.record-type", value: "persoon" }],
    });
  });
});

describe("describeCreatedEntity", () => {
  it("derives the label from a title-ish intial value and details from the rest", () => {
    expect(
      describeCreatedEntity({
        id: "expr-1",
        intialValues: {
          id: "expr-1",
          typePillLabel: "Lezen",
          expression_title: "Kamer der geheimen",
          record_type: "tekst",
          refLanguages: ["Nederlands"],
          created_at: "2026-06-12T10:05:24.647072+00:00",
          created_by: "developers@inuits.eu",
          updated_at: "",
          updated_by: "",
        },
      }),
    ).toEqual({
      label: "Kamer der geheimen",
      details: [
        { label: "record_type", value: "tekst" },
        { label: "refLanguages", value: "Nederlands" },
      ],
    });
  });

  it("returns no label or details for an entity without intialValues", () => {
    expect(describeCreatedEntity({ id: "x" })).toEqual({
      label: undefined,
      details: [],
    });
  });
});
