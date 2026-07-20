import { ref, unref } from "vue";
import {
  AdvancedFilterTypes,
  EditStatus,
  RepetitiveRelationTrigger,
  type AdvancedFilterInput,
  type BaseRelationValuesInput,
  type Entitytyping,
  type MetadataInput,
  type RepetitiveForm,
  type RepetitiveStep,
  type RepetitiveStepRelation,
} from "@/generated-types/queries";
import { useManageEntities } from "@/composables/useManageEntities";
import { useFormHelper } from "@/composables/useFormHelper";
import type { InBulkProcessableItem } from "@/composables/useBulkOperations";

export type StagedEntityDetail = {
  label: string; // translation key (or raw metadata key as fallback)
  value: string;
};

export type StagedEntity = {
  key: string; // step key
  id: string; // real entity id
  type: Entitytyping;
  label?: string;
  details?: StagedEntityDetail[]; // extra display info for the overview
  values?: Record<string, unknown>; // intialValues snapshot for overviewFields
  isNew: boolean;
};

export const toDisplayValue = (value: unknown): string => {
  if (Array.isArray(value))
    return value
      .filter((entry) => typeof entry === "string" || typeof entry === "number")
      .join(", ");
  if (typeof value === "string" || typeof value === "number")
    return String(value);
  return "";
};

// Picker items carry teaserMetadata entries of { label, key }; the matching
// display values live under the same key in the item's intialValues.
export const describePickedItem = (item: {
  id: string;
  value?: string;
  teaserMetadata?: unknown;
  intialValues?: Record<string, unknown>;
}): { label?: string; details: StagedEntityDetail[] } => {
  const values = item.intialValues ?? {};
  const entries = (
    Array.isArray(item.teaserMetadata) ? item.teaserMetadata : []
  )
    .filter((entry): entry is { label: string; key: string } =>
      Boolean(entry && typeof entry === "object" && entry.label && entry.key),
    )
    .map((entry) => ({
      key: entry.key,
      label: entry.label,
      value: toDisplayValue(values[entry.key]),
    }))
    .filter((entry) => entry.value);

  const labelEntry =
    entries.find((entry) => /title/i.test(entry.key)) ?? entries[0];
  return {
    label: item.value || labelEntry?.value || undefined,
    details: entries
      .filter((entry) => entry !== labelEntry)
      .map(({ label, value }) => ({ label, value }))
      .slice(0, 3),
  };
};

// A freshly created entity only has intialValues (no teaser labels): use a
// title-ish key for the label and the remaining displayable values as details.
export const describeCreatedEntity = (
  entity: any,
): { label?: string; details: StagedEntityDetail[] } => {
  const values: Record<string, unknown> = entity?.intialValues ?? {};
  const isDisplayable = (key: string) =>
    !/^(id|uuid|__typename)$/.test(key) &&
    !/^(created|updated)_(at|by)$/.test(key) &&
    !/pill/i.test(key) &&
    Boolean(toDisplayValue(values[key]));

  const labelKey =
    ["title", "label"].find(
      (key) => typeof values[key] === "string" && values[key],
    ) ??
    Object.keys(values).find((key) => /title/i.test(key) && isDisplayable(key));

  return {
    label: labelKey ? toDisplayValue(values[labelKey]) : undefined,
    details: Object.keys(values)
      .filter((key) => key !== labelKey && isDisplayable(key))
      .map((key) => ({ label: key, value: toDisplayValue(values[key]) }))
      .slice(0, 3),
  };
};

export type PendingHostRelation = {
  step: RepetitiveStep;
  fieldValues: Record<string, unknown>;
};

export type RepetitiveBranch = {
  entities: Record<string, StagedEntity>;
  pendingHostRelations: PendingHostRelation[];
};

export const buildRelationMetadata = (
  relation: RepetitiveStepRelation,
  fieldValues: Record<string, unknown>,
): MetadataInput[] =>
  (relation.metadataFields ?? [])
    .filter((field) => fieldValues[field.formMetadataKey] !== undefined)
    .map((field) => ({
      key: field.relationMetadataKey,
      value: field.asArray
        ? [fieldValues[field.formMetadataKey]]
        : fieldValues[field.formMetadataKey],
    }));

const newBranch = (): RepetitiveBranch => ({
  entities: {},
  pendingHostRelations: [],
});

const flowConfig = ref<RepetitiveForm | null>(null);
const currentStepIndex = ref<number>(0);
const currentBranch = ref<RepetitiveBranch>(newBranch());
const branches = ref<RepetitiveBranch[]>([]);

export const useRepetitiveForm = () => {
  const { createEntity, addRelations, saveEntityValues } = useManageEntities();
  const {
    getForm,
    replaceRelationsFromSameType,
    addRelations: setFormRelations,
    parseFormValuesToFormInput,
  } = useFormHelper();

  const resetFlow = () => {
    flowConfig.value = null;
    currentStepIndex.value = 0;
    currentBranch.value = newBranch();
    branches.value = [];
  };

  const initFlow = (config: RepetitiveForm) => {
    resetFlow();
    flowConfig.value = config;
  };

  const activeStep = (): RepetitiveStep | null =>
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
    currentBranch.value = newBranch();
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

  const completeMetadataOnlyStep = () => {
    if (isLastStep()) {
      finishBranch();
    } else {
      currentStepIndex.value++;
    }
  };

  const recordEntity = (entity: StagedEntity) => {
    currentBranch.value.entities[entity.key] = entity;
  };

  const pickExisting = (entity: {
    id: string;
    label?: string;
    details?: StagedEntityDetail[];
    values?: Record<string, unknown>;
  }) => {
    const step = activeStep();
    if (!step) return;
    recordEntity({
      key: step.key,
      id: entity.id,
      type: step.entityType as Entitytyping,
      label: entity.label,
      details: entity.details,
      values: entity.values,
      isNew: false,
    });
  };

  const removeBranch = (index: number) => {
    branches.value.splice(index, 1);
  };

  const goToPreviousStep = () => {
    if (currentStepIndex.value > 0) currentStepIndex.value--;
  };

  const buildScopeFilter = (
    step: RepetitiveStep,
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

  const shouldSkipSearch = (step: RepetitiveStep): boolean => {
    if (!step.skipSearchIfPriorIsNew || !step.scopeToRelationOf) return false;
    const prior = currentBranch.value.entities[step.scopeToRelationOf.step];
    return Boolean(prior?.isNew);
  };

  const buildCreateRelations = (
    step: RepetitiveStep,
  ): BaseRelationValuesInput[] =>
    (step.relations ?? [])
      .filter(
        (relation) =>
          relation.createWhen === RepetitiveRelationTrigger.OnCreate ||
          relation.createWhen === RepetitiveRelationTrigger.Always,
      )
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
    type?: string; // concrete subtype chosen on the create screen
    label?: string;
    details?: StagedEntityDetail[];
    values?: Record<string, unknown>;
  }) => {
    const step = activeStep();
    if (!step) return;
    recordEntity({
      key: step.key,
      id: entity.id ?? entity.uuid ?? "",
      type: (entity.type ?? step.entityType) as Entitytyping,
      label: entity.label,
      details: entity.details,
      values: entity.values,
      isNew: true,
    });
  };

  const buildCreatePrefill = (
    step: RepetitiveStep,
  ): { relationValues: Record<string, BaseRelationValuesInput[]> } => {
    const relationValues: Record<string, BaseRelationValuesInput[]> = {};
    buildCreateRelations(step).forEach((relation) => {
      const type = relation.type as string;
      (relationValues[type] ??= []).push(relation);
    });
    return { relationValues };
  };

  const applyStepRelations = async (
    step: RepetitiveStep,
    triggers: RepetitiveRelationTrigger[],
    fieldValues: Record<string, unknown> = {},
  ): Promise<void> => {
    const entity = currentBranch.value.entities[step.key];
    if (!entity) return;
    for (const relation of step.relations ?? []) {
      if (!triggers.includes(relation.createWhen)) continue;
      const prior = currentBranch.value.entities[relation.to];
      if (!prior) continue;
      const metadata = buildRelationMetadata(relation, fieldValues);
      await addRelations({
        entityId: entity.id,
        relations: [
          {
            key: prior.id,
            type: relation.relationType,
            editStatus: EditStatus.New,
            ...(metadata.length ? { metadata } : {}),
          },
        ],
      });
    }
  };

  const linkHostRelations = async (
    branch: RepetitiveBranch,
    step: RepetitiveStep,
    hostEntityId: string,
    fieldValues: Record<string, unknown>,
  ): Promise<void> => {
    for (const relation of step.relations ?? []) {
      const target = branch.entities[relation.to];
      if (!target) continue;
      const metadata = buildRelationMetadata(relation, fieldValues);
      await addRelations({
        entityId: hostEntityId,
        relations: [
          {
            key: target.id,
            type: relation.relationType,
            editStatus: EditStatus.New,
            ...(metadata.length ? { metadata } : {}),
          },
        ],
      });
    }
  };

  const stagePendingHostRelation = (
    step: RepetitiveStep,
    fieldValues: Record<string, unknown>,
  ) => {
    currentBranch.value.pendingHostRelations.push({
      step,
      fieldValues: { ...fieldValues },
    });
  };

  const commitPendingHostRelations = async (
    hostEntityId: string,
  ): Promise<void> => {
    for (const branch of branches.value) {
      for (const pending of branch.pendingHostRelations) {
        await linkHostRelations(
          branch,
          pending.step,
          hostEntityId,
          pending.fieldValues,
        );
      }
    }
  };

  // an existing entity was picked → apply onSelect/always relations
  const linkOnSelect = (
    step: RepetitiveStep,
    fieldValues: Record<string, unknown> = {},
  ): Promise<void> =>
    applyStepRelations(
      step,
      [RepetitiveRelationTrigger.OnSelect, RepetitiveRelationTrigger.Always],
      fieldValues,
    );

  // a new entity was created → apply onCreate/always relations
  const linkAfterCreate = (
    step: RepetitiveStep,
    fieldValues: Record<string, unknown> = {},
  ): Promise<void> =>
    applyStepRelations(
      step,
      [RepetitiveRelationTrigger.OnCreate, RepetitiveRelationTrigger.Always],
      fieldValues,
    );

  const isLinear = (): boolean => Boolean(flowConfig.value?.linear);

  const routeTarget = (): StagedEntity | null => {
    const entities = currentBranch.value.entities;
    const routeKey = flowConfig.value?.routeToStep;
    if (routeKey) return entities[routeKey] ?? null;
    // no explicit target: route to the furthest staged step's entity
    const steps = flowConfig.value?.steps ?? [];
    for (let i = steps.length - 1; i >= 0; i--) {
      const entity = entities[steps[i].key];
      if (entity) return entity;
    }
    return null;
  };

  const createForStep = async (
    step: RepetitiveStep,
    metadata: MetadataInput[],
  ) => {
    const created = await createEntity({
      entityType: step.entityType as Entitytyping,
      metadata,
      relations: buildCreateRelations(step),
    });
    recordEntity({
      key: step.key,
      id: created.id ?? created.uuid,
      type: step.entityType as Entitytyping,
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
      entityType: config.entityType as Entitytyping,
      metadata,
      relations: buildFinalizeRelations(),
    });
  };

  const finalizeOnHost = async (
    hostId: string | undefined,
  ): Promise<{ id: string } | null> => {
    const config = flowConfig.value?.finalizeOnHost;
    if (!config || !hostId) return null;
    const staged = currentBranch.value.entities[config.fromStep];
    if (!staged) return null;
    const form = getForm(hostId);
    if (!form) return null;
    const items = [{ id: staged.id }] as InBulkProcessableItem[];
    if (config.replaceExisting)
      replaceRelationsFromSameType(items, config.relationType, hostId);
    else setFormRelations(items, config.relationType, hostId, true);
    await saveEntityValues(
      hostId,
      parseFormValuesToFormInput(hostId, unref(form.values), true),
    );
    return { id: hostId };
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
    removeBranch,
    goToPreviousStep,
    completeStep,
    completeMetadataOnlyStep,
    recordEntity,
    pickExisting,
    recordCreated,
    buildScopeFilter,
    shouldSkipSearch,
    buildCreateRelations,
    buildCreatePrefill,
    linkOnSelect,
    linkAfterCreate,
    stagePendingHostRelation,
    commitPendingHostRelations,
    isLinear,
    routeTarget,
    createForStep,
    collectedFor,
    buildFinalizeRelations,
    buildFinalizePrefill,
    finalize,
    finalizeOnHost,
  };
};
