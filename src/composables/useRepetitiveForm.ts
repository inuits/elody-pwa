import { ref } from "vue";
import {
  AdvancedFilterTypes,
  EditStatus,
  type AdvancedFilterInput,
  type BaseRelationValuesInput,
  type Entitytyping,
  type MetadataInput,
} from "@/generated-types/queries";
import { useManageEntities } from "@/composables/useManageEntities";

export type RelationCreateWhen = "onCreate" | "onFinalize";

export type StepRelationConfig = {
  to: string; // prior step key
  relationType: string;
  createWhen: RelationCreateWhen;
};

export type StepScopeConfig = {
  step: string; // prior step key whose selected entity scopes this search
  relationType: string;
  // optional override for the advanced-filter key; defaults to the
  // elody-dialect relation key built from relationType
  filterKey?: string;
};

export type RepetitiveStepConfig = {
  key: string;
  label?: string; // display label (translation key) for the step
  entityType: Entitytyping;
  createForm: string;
  scopeToRelationOf?: StepScopeConfig;
  skipSearchIfPriorIsNew?: boolean;
  relations?: StepRelationConfig[];
  acceptedTypes?: Entitytyping[]; // picker accepted types; defaults to [entityType]
  pickerQuery?: string; // GraphQL query name the picker uses to fetch candidates
  pickerFiltersQuery?: string; // optional filters query for the picker
};

export type FinalizeRelationConfig = {
  toAllOf: string; // step key whose collected entities are linked
  relationType: string;
  // pinned: finalize relations are only ever created at finalize time
  createWhen: "onFinalize";
};

export type MetadataPrefillConfig = {
  key: string;
  value: unknown;
};

export type RepetitiveFinalizeConfig = {
  label?: string; // display label (translation key) for the finalize view
  entityType: Entitytyping;
  createForm: string;
  relations: FinalizeRelationConfig[];
  prefillMetadata?: MetadataPrefillConfig[];
};

export type RepetitiveFormConfig = {
  label?: string; // display label (translation key) for the whole flow
  repeatable: boolean;
  steps: RepetitiveStepConfig[];
  finalize?: RepetitiveFinalizeConfig;
};

export type StagedEntity = {
  key: string; // step key
  id: string; // real entity id
  type: Entitytyping;
  label?: string;
  isNew: boolean;
};

export type RepetitiveBranch = {
  entities: Record<string, StagedEntity>;
};

const flowConfig = ref<RepetitiveFormConfig | null>(null);
const currentStepIndex = ref<number>(0);
const currentBranch = ref<RepetitiveBranch>({ entities: {} });
const branches = ref<RepetitiveBranch[]>([]);

export const useRepetitiveForm = () => {
  const { createEntity } = useManageEntities();

  const resetFlow = () => {
    flowConfig.value = null;
    currentStepIndex.value = 0;
    currentBranch.value = { entities: {} };
    branches.value = [];
  };

  const initFlow = (config: RepetitiveFormConfig) => {
    resetFlow();
    flowConfig.value = config;
  };

  const activeStep = (): RepetitiveStepConfig | null =>
    flowConfig.value?.steps[currentStepIndex.value] ?? null;

  const isLastStep = (): boolean => {
    const steps = flowConfig.value?.steps ?? [];
    return steps.length > 0 && currentStepIndex.value === steps.length - 1;
  };

  const canCompleteStep = (): boolean => {
    const step = activeStep();
    if (!step) return false;
    return Boolean(currentBranch.value.entities[step.key]);
  };

  const finishBranch = () => {
    branches.value.push(currentBranch.value);
    startNewBranch();
  };

  const startNewBranch = () => {
    currentBranch.value = { entities: {} };
    currentStepIndex.value = 0;
  };

  const completeStep = () => {
    if (!canCompleteStep()) return;
    if (isLastStep()) {
      finishBranch();
    } else {
      currentStepIndex.value++;
    }
  };

  const recordEntity = (entity: StagedEntity) => {
    currentBranch.value.entities[entity.key] = entity;
  };

  const pickExisting = (entity: { id: string; label?: string }) => {
    const step = activeStep();
    if (!step) return;
    recordEntity({
      key: step.key,
      id: entity.id,
      type: step.entityType,
      label: entity.label,
      isNew: false,
    });
  };

  const buildScopeFilter = (
    step: RepetitiveStepConfig,
  ): AdvancedFilterInput | null => {
    if (!step.scopeToRelationOf) return null;
    const prior = currentBranch.value.entities[step.scopeToRelationOf.step];
    if (!prior) return null;
    const filterKey =
      step.scopeToRelationOf.filterKey ??
      `elody:1|relations.${step.scopeToRelationOf.relationType}.key`;
    return {
      type: AdvancedFilterTypes.Selection,
      key: [filterKey],
      value: [prior.id],
      match_exact: true,
    };
  };

  const shouldSkipSearch = (step: RepetitiveStepConfig): boolean => {
    if (!step.skipSearchIfPriorIsNew || !step.scopeToRelationOf) return false;
    const prior = currentBranch.value.entities[step.scopeToRelationOf.step];
    return Boolean(prior?.isNew);
  };

  const buildCreateRelations = (
    step: RepetitiveStepConfig,
  ): BaseRelationValuesInput[] =>
    (step.relations ?? [])
      .filter((relation) => relation.createWhen === "onCreate")
      .flatMap((relation) => {
        const target = currentBranch.value.entities[relation.to];
        if (!target) return [];
        return [
          {
            key: target.id,
            type: relation.relationType,
            editStatus: EditStatus.New,
          },
        ];
      });

  const recordCreated = (entity: {
    id?: string;
    uuid?: string;
    label?: string;
  }) => {
    const step = activeStep();
    if (!step) return;
    recordEntity({
      key: step.key,
      id: entity.id ?? entity.uuid ?? "",
      type: step.entityType,
      label: entity.label,
      isNew: true,
    });
  };

  const buildCreatePrefill = (
    step: RepetitiveStepConfig,
  ): { relationValues: Record<string, BaseRelationValuesInput[]> } => {
    const relationValues: Record<string, BaseRelationValuesInput[]> = {};
    buildCreateRelations(step).forEach((relation) => {
      const type = relation.type as string;
      (relationValues[type] ??= []).push(relation);
    });
    return { relationValues };
  };

  const createForStep = async (
    step: RepetitiveStepConfig,
    metadata: MetadataInput[],
  ) => {
    const created = await createEntity({
      entityType: step.entityType,
      metadata,
      relations: buildCreateRelations(step),
    });
    recordEntity({
      key: step.key,
      id: created.id ?? created.uuid,
      type: step.entityType,
      label: undefined,
      isNew: true,
    });
    return created;
  };

  const collectedFor = (stepKey: string): StagedEntity[] =>
    branches.value
      .map((branch) => branch.entities[stepKey])
      .filter((entity): entity is StagedEntity => Boolean(entity));

  const buildFinalizeRelations = (): BaseRelationValuesInput[] => {
    const finalizeConfig = flowConfig.value?.finalize;
    if (!finalizeConfig) return [];
    return finalizeConfig.relations.flatMap((relation) =>
      collectedFor(relation.toAllOf).map((entity) => ({
        key: entity.id,
        type: relation.relationType,
        editStatus: EditStatus.New,
      })),
    );
  };

  const buildFinalizePrefill = (): {
    relationValues: Record<string, BaseRelationValuesInput[]>;
    intialValues: Record<string, unknown>;
  } => {
    const relationValues: Record<string, BaseRelationValuesInput[]> = {};
    buildFinalizeRelations().forEach((relation) => {
      const type = relation.type as string;
      (relationValues[type] ??= []).push(relation);
    });
    const intialValues: Record<string, unknown> = {};
    (flowConfig.value?.finalize?.prefillMetadata ?? []).forEach((metadata) => {
      intialValues[metadata.key] = metadata.value;
    });
    return { relationValues, intialValues };
  };

  const finalize = async (metadata: MetadataInput[]) => {
    const config = flowConfig.value?.finalize;
    if (!config) throw new Error("No finalize config for this flow");
    return await createEntity({
      entityType: config.entityType,
      metadata,
      relations: buildFinalizeRelations(),
    });
  };

  return {
    flowConfig,
    currentStepIndex,
    currentBranch,
    branches,
    resetFlow,
    initFlow,
    activeStep,
    isLastStep,
    canCompleteStep,
    finishBranch,
    startNewBranch,
    completeStep,
    recordEntity,
    pickExisting,
    recordCreated,
    buildScopeFilter,
    shouldSkipSearch,
    buildCreateRelations,
    buildCreatePrefill,
    createForStep,
    collectedFor,
    buildFinalizeRelations,
    buildFinalizePrefill,
    finalize,
  };
};
