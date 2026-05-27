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
    await updateRelationDirect(relatedEntity, inverseRelationType, entityId, updates);
  }
};
