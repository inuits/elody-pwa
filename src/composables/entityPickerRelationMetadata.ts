import type { InBulkProcessableItem } from "@/composables/useBulkOperations";
import type { RelationMetadataFromFormField } from "@/composables/useEntityPickerModal";

export const buildItemsWithRelationMetadata = (
  items: InBulkProcessableItem[],
  metadataFields: RelationMetadataFromFormField[],
  formInitialValues: Record<string, any>,
): InBulkProcessableItem[] => {
  if (metadataFields.length === 0) return items;

  const extraMetadata = metadataFields
    .map(({ formMetadataKey, relationMetadataKey, asArray }) => {
      const value = formInitialValues?.[formMetadataKey];
      if (value === undefined || value === null || value === "") return null;
      return { key: relationMetadataKey, value: asArray ? [value] : value };
    })
    .filter(Boolean) as { key: string; value: any }[];

  if (extraMetadata.length === 0) return items;

  return items.map((item) => ({
    ...item,
    metadata: [...(item.metadata ?? []), ...extraMetadata],
  }));
};
