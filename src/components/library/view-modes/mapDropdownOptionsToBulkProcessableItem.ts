import type {
  BaseRelationValuesInput,
  DropdownOption,
} from "@/generated-types/queries";
import type { InBulkProcessableItem } from "@/composables/useBulkOperations";

type MetadataOnRelationConfig = {
  enabled: boolean;
  key: string;
};

export const mapDropdownOptionsToBulkProcessableItem = (
  dropdownOptions: DropdownOption[],
  metadataOnRelationConfig?: MetadataOnRelationConfig,
  tagInputValues?: Map<string | number, string>,
): InBulkProcessableItem[] => {
  return dropdownOptions.map((dropdownOption) => {
    const item: InBulkProcessableItem = {
      id: dropdownOption.value,
      value: dropdownOption.label,
    };

    if (metadataOnRelationConfig?.enabled && metadataOnRelationConfig.key) {
      const tagValue = tagInputValues?.get(dropdownOption.value);
      if (tagValue !== undefined && tagValue !== "") {
        item.metadata = [
          {
            key: metadataOnRelationConfig.key,
            value: tagValue,
          },
        ];
      }
    }

    return item;
  });
};

export const extractTagInputValuesFromRelations = (
  relations: BaseRelationValuesInput[],
  metadataKey: string,
): Map<string | number, string> => {
  const map = new Map<string | number, string>();
  for (const relation of relations) {
    const meta = relation.metadata?.find((m) => m?.key === metadataKey);
    if (meta?.value !== undefined && meta.value !== "") {
      map.set(relation.key!, String(meta.value));
    }
  }
  return map;
};
