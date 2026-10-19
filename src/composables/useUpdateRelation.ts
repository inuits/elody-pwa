import { EditStatus, type Entity } from "@/generated-types/queries";
import { useFormHelper } from "@/composables/useFormHelper";
import {
  mutateEntityRelations,
  findInverseRelationType,
} from "@/composables/useRelationMutation";

export const updateRelationDirect = async (
  entity: Entity,
  relationType: string,
  relationKey: string,
  metadataUpdates: Record<string, any>,
): Promise<void> => {
  await mutateEntityRelations(entity, relationType, (relation) => {
    if (relation.key !== relationKey)
      return { ...relation, editStatus: EditStatus.Unchanged };

    const existingMetadata: Array<{ key: string; value: any }> =
      (relation as any).metadata ?? [];

    const patchedMetadata = existingMetadata.map((metadataEntry) => {
      if (!(metadataEntry.key in metadataUpdates)) return metadataEntry;
      const newValue = metadataUpdates[metadataEntry.key];
      const value =
        Array.isArray(metadataEntry.value) && !Array.isArray(newValue)
          ? [newValue]
          : newValue;
      return { ...metadataEntry, value };
    });

    for (const [key, newValue] of Object.entries(metadataUpdates)) {
      if (!patchedMetadata.some((metadataEntry) => metadataEntry.key === key)) {
        patchedMetadata.push({ key, value: newValue });
      }
    }

    return { ...relation, metadata: patchedMetadata, editStatus: EditStatus.Changed };
  });
};

const unwrapFormatterValue = (value: any): any => {
  if (value !== null && typeof value === "object" && "formatter" in value)
    return value.label;
  return value;
};

export const saveRelatedEntityData = async (
  entityId: string,
  relatedEntities: Entity[],
): Promise<void> => {
  const { getForm } = useFormHelper();
  const form = getForm(entityId);
  if (!form) return;

  const relatedEntityData = form.values.relatedEntityData?.relations as
    | Record<string, any>
    | undefined;
  if (!relatedEntityData || !Object.keys(relatedEntityData).length) return;

  const updatesByEntityId: Record<string, Record<string, any>> = {};
  for (const [compoundKey, value] of Object.entries(relatedEntityData)) {
    if (value === undefined || value === null) continue;
    const dashIdx = compoundKey.indexOf("-");
    const fieldKey = compoundKey.slice(0, dashIdx);
    const linkedEntityId = compoundKey.slice(dashIdx + 1);
    (updatesByEntityId[linkedEntityId] ??= {})[fieldKey] =
      unwrapFormatterValue(value);
  }

  for (const [linkedEntityId, updates] of Object.entries(updatesByEntityId)) {
    const relatedEntity = relatedEntities.find(
      (entity) => entity.id === linkedEntityId,
    );
    if (!relatedEntity) continue;
    const inverseRelationType = findInverseRelationType(relatedEntity, entityId);
    if (!inverseRelationType) continue;
    const changedUpdates = keepChangedUpdates(
      updates,
      findRelationMetadata(relatedEntity, inverseRelationType, entityId),
    );
    if (!Object.keys(changedUpdates).length) continue;
    await updateRelationDirect(
      relatedEntity,
      inverseRelationType,
      entityId,
      changedUpdates,
    );
  }
};

const findRelationMetadata = (
  entity: Entity,
  relationType: string,
  relationKey: string,
): Array<{ key: string; value: any }> => {
  const relations = (entity.relationValues ?? {}) as Record<string, any[]>;
  return (
    relations[relationType]?.find(
      (relation) => relation.key === relationKey,
    )?.metadata ?? []
  );
};

const isEmptyValue = (value: any): boolean =>
  value === "" || (Array.isArray(value) && !value.length);

const hasSameValue = (currentValue: any, newValue: any): boolean => {
  const normalized =
    Array.isArray(currentValue) && !Array.isArray(newValue)
      ? [newValue]
      : newValue;
  return JSON.stringify(currentValue) === JSON.stringify(normalized);
};

// Every rendered relation field seeds itself with the value it was displayed
// with, so an untouched field is indistinguishable from an edited one by
// presence alone. Compare against what the relation already holds and only send
// real changes — otherwise saving unrelated metadata (a title, say) rewrites
// every linked entity, and a display-formatted value that never round-trips
// (an empty pill, a label string) fails validation.
const keepChangedUpdates = (
  updates: Record<string, any>,
  currentMetadata: Array<{ key: string; value: any }>,
): Record<string, any> =>
  Object.fromEntries(
    Object.entries(updates).filter(([key, value]) => {
      const current = currentMetadata.find((entry) => entry.key === key);
      if (!current) return !isEmptyValue(value);
      return !hasSameValue(current.value, value);
    }),
  );
