import { computed, inject } from "vue";
import {
  type AdvancedFilterInput,
  AdvancedFilterTypes,
  Operator,
} from "@/generated-types/queries";

export function useSimpleSearch() {
  const config = inject("config") as any;

  const entityTypeFilters = computed<AdvancedFilterInput[]>(() => {
    // The app config only lists the item types the user may read.
    const allowedTypes = config.features.simpleSearch.itemTypes;
    if (!allowedTypes || allowedTypes.length === 0) return [];
    return [
      {
        match_exact: true,
        type: AdvancedFilterTypes.Selection,
        key: "type",
        value: allowedTypes,
      },
    ];
  });

  const createKeyBasedOnFormat = (metadataKey: string | object): string[] => {
    if (typeof metadataKey === "object" && (metadataKey as any)?.preConfigured) {
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

  const buildFilters = (searchTerm: string): AdvancedFilterInput[] => {
    const filters: AdvancedFilterInput[] = [...entityTypeFilters.value];
    const metadataKeys = config.features.simpleSearch.simpleSearchMetadataKey;
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

  return { buildFilters };
}
