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
  await mutateEntityRelations(entity, relationType, (r) => {
    if (r.key !== relationKey) return { ...r, editStatus: EditStatus.Unchanged };

    const existingMetadata: Array<{ key: string; value: any }> =
      (r as any).metadata ?? [];

    const patchedMetadata = existingMetadata.map((entry) => {
      if (!(entry.key in metadataUpdates)) return entry;
      const newVal = metadataUpdates[entry.key];
      const value =
        Array.isArray(entry.value) && !Array.isArray(newVal)
          ? [newVal]
          : newVal;
      return { ...entry, value };
    });

    for (const [key, newVal] of Object.entries(metadataUpdates)) {
      if (!patchedMetadata.some((e) => e.key === key)) {
        patchedMetadata.push({ key, value: newVal });
      }
    }

    return { ...r, metadata: patchedMetadata, editStatus: EditStatus.Changed };
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
    const relatedEntity = relatedEntities.find((e) => e.id === linkedEntityId);
    if (!relatedEntity) continue;
    const inverseRelationType = findInverseRelationType(relatedEntity, entityId);
    if (!inverseRelationType) continue;
    await updateRelationDirect(relatedEntity, inverseRelationType, entityId, updates);
  }
};
