import { computed, inject } from "vue";
import {
  type AdvancedFilterInput,
  AdvancedFilterTypes,
  Operator,
} from "@/generated-types/queries";

export function useSimpleSearch() {
  const config = inject("config") as any;

  const itemTypes = computed<string[]>(
    () => config.features.simpleSearch?.itemTypes ?? [],
  );

  const entityTypeFilters = (types: string[]): AdvancedFilterInput[] => {
    if (types.length === 0) return [];
    return [
      {
        match_exact: true,
        type: AdvancedFilterTypes.Selection,
        key: "type",
        value: types,
      },
    ];
  };

  const createKeyBasedOnFormat = (metadataKey: string | object): string[] => {
    if (
      typeof metadataKey === "object" &&
      (metadataKey as any)?.preConfigured
    ) {
      return (metadataKey as any).key;
    }
    const clientKeyFormat = config.features.simpleSearch.clientKeyFormat;
    if (!clientKeyFormat || clientKeyFormat.length === 0) {
      return [`elody:1|metadata.${metadataKey}.value`];
    }
    return clientKeyFormat.map((format: string) =>
      format.replace(/\$metadata_key/g, metadataKey as string),
    );
  };

  const buildFilters = (
    searchTerm: string,
    types: string[] = itemTypes.value,
  ): AdvancedFilterInput[] => {
    const filters: AdvancedFilterInput[] = [...entityTypeFilters(types)];
    const metadataKeys = config.features.simpleSearch.simpleSearchMetadataKey;
    const relationKeys = config.features.simpleSearch.relationKeys;
    if (relationKeys?.length) {
      filters.push({
        key: metadataKeys.flatMap((metadataKey: string | object) =>
          createKeyBasedOnFormat(metadataKey),
        ),
        value: searchTerm,
        type: AdvancedFilterTypes.Text,
        operator: Operator.Or,
        match_exact: false,
        relation_keys: relationKeys,
      });
      return filters;
    }
    for (const index in metadataKeys) {
      filters.push({
        key: createKeyBasedOnFormat(metadataKeys[index]),
        value: searchTerm,
        type: AdvancedFilterTypes.Text,
        operator: Operator.Or,
        match_exact: false,
      });
    }
    return filters;
  };

  return { buildFilters, itemTypes };
}
