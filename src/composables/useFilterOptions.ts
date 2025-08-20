import type {
  Entitytyping,
  AdvancedFilterInput,
  BaseEntity,
  DropdownOption,
} from "@/generated-types/queries";
import {
  AdvancedFilterTypes,
  DamsIcons,
  SearchInputType,
} from "@/generated-types/queries";
import { computed } from "vue";
import { useBaseLibrary } from "@/components/library/useBaseLibrary";
import type { ApolloClient } from "@apollo/client/core";
import { getEntityTitle } from "@/helpers";
import { useFiltersBaseNew } from "@/composables/useFiltersBaseNew";
import { apolloClient } from "@/main";
import { useImport } from "@/composables/useImport";
import { ref } from "vue";
import { extractValueFromObject } from "@/helpers";

type FilterOptionsMappingType = {
  label?: string;
  value?: string;
};

export const useFilterOptions = () => {
  const { loadDocument } = useImport();
  const optionsLibrary = useBaseLibrary(apolloClient as ApolloClient<any>);
  const facetsLibrary = useBaseLibrary(apolloClient as ApolloClient<any>);

  const optionsFiltersManager = useFiltersBaseNew();
  const facetsFiltersManager = useFiltersBaseNew();
  const dropdownOptions = ref<DropdownOption[]>([]);
  const isLoading = ref<boolean>(false);
  const filterOptionsMapping = ref<FilterOptionsMappingType | undefined>(
    undefined,
  );
  const query = ref<any>();
  const entityType = ref<string | Entitytyping>("");
  const rawOptions = ref<DropdownOption[]>([]);
  const facetCounts = ref<Map<string, number>>(new Map());
  const hasFacets = ref<boolean>(false);

  const init = async (
    entityTypeToSet: string | Entitytyping,
    filterOptionsMappingValue?: FilterOptionsMappingType,
  ) => {
    query.value = await loadDocument("GetFilterOptions");
    entityType.value = entityTypeToSet;
    optionsFiltersManager.setVariables({ entityType: entityTypeToSet });
    facetsFiltersManager.setVariables({ entityType: entityTypeToSet });
    filterOptionsMapping.value = filterOptionsMappingValue;
  };

  const getBaseOptions = async () => {
    try {
      const entityTypeToSet = optionsFiltersManager
        .getNormalizedFiltersForApi()
        .find((filter) => filter.type === AdvancedFilterTypes.Type)?.value;
      optionsLibrary.setAdvancedFilters(
        optionsFiltersManager.getNormalizedFiltersForApi(),
      );
      optionsLibrary.setsearchInputType(SearchInputType.AdvancedInputType);
      optionsLibrary.setEntityType(
        entityTypeToSet || (entityType.value as Entitytyping),
      );

      await optionsLibrary.getEntities(undefined);
      isLoading.value = false;
    } catch (error) {
      isLoading.value = false;
    }
  };

  const parseFacetsToCountMap = (rawFacets: any[]): Map<string, number> => {
    const countMap = new Map<string, number>();
    if (!Array.isArray(rawFacets)) {
      return countMap;
    }

    for (const facetGroup of rawFacets) {
      const facetEntries = Object.values(facetGroup)[0];

      if (Array.isArray(facetEntries)) {
        for (const entry of facetEntries) {
          if (entry._id && typeof entry.count === "number") {
            countMap.set(entry._id, entry.count);
          }
        }
      }
    }

    return countMap;
  };

  const loadOptionsAndFacetsInParallel = async (
    facetRequestFilters?: AdvancedFilterInput[],
  ) => {
    isLoading.value = true;

    const fetchOptionsTask = async (): Promise<BaseEntity[]> => {
      const entityTypeToSet = optionsFiltersManager
        .getNormalizedFiltersForApi()
        .find((filter) => filter.type === AdvancedFilterTypes.Type)?.value;
      await optionsLibrary.setAdvancedFilters(
        optionsFiltersManager.getNormalizedFiltersForApi(),
      );
      await optionsLibrary.setEntityType(
        entityTypeToSet || (entityType.value as Entitytyping),
      );
      optionsLibrary.setsearchInputType(SearchInputType.AdvancedInputType);
      await optionsLibrary.getEntities(undefined);

      return optionsLibrary.entities.value || [];
    };

    const fetchFacetsTask = async (): Promise<any[]> => {
      if (!facetRequestFilters) return [];
      hasFacets.value = true;

      await facetsFiltersManager.initializeFilters({
        advancedFilters:
          facetsFiltersManager.transformFilterInputIntoAdvancedFilters(
            facetRequestFilters,
          ),
        fromState: false,
      });

      const entityTypeToSet = facetsFiltersManager
        .getNormalizedFiltersForApi({ ignoreFacets: false })
        .find((filter) => filter.type === AdvancedFilterTypes.Type)?.value;
      await facetsLibrary.setEntityType(entityTypeToSet);
      facetsLibrary.setsearchInputType(SearchInputType.AdvancedInputType);
      await facetsLibrary.setAdvancedFilters(
        facetsFiltersManager.getNormalizedFiltersForApi({
          ignoreFacets: false,
        }),
      );

      await facetsLibrary.getEntities(undefined);

      return facetsLibrary.facets.value;
    };

    try {
      const [fetchedEntities, rawFacetData] = await Promise.all([
        fetchOptionsTask(),
        fetchFacetsTask(),
      ]);

      optionsLibrary.entities.value = fetchedEntities;
      facetCounts.value = parseFacetsToCountMap(rawFacetData);
    } catch (error) {
      console.error("Failed to load options or facets in parallel:", error);
      rawOptions.value = [];
      facetCounts.value = new Map();
    } finally {
      isLoading.value = false;
    }
  };

  const setFilters = async (newFilters: AdvancedFilterInput[]) => {
    await optionsFiltersManager.initializeFilters({
      advancedFilters:
        optionsFiltersManager.transformFilterInputIntoAdvancedFilters(
          newFilters,
        ),
      fromState: false,
    });
  };

  const getOptions = async () => {
    try {
      const result = await apolloClient.query({
        query: query.value,
        variables: {
          input: optionsFiltersManager
            .getNormalizedFiltersForApi()
            .map((filter) => ({
              ...filter,
              // TODO: should be defined in the GRAPHQL, not here
              provide_value_options_for_key:
                filter.type !== AdvancedFilterTypes.Type,
            })),
          limit: 11,
          entityType: entityType.value,
        },
        fetchPolicy: "no-cache",
        notifyOnNetworkStatusChange: true,
      });

      dropdownOptions.value = result.data.FilterOptions;
      isLoading.value = false;
    } catch (error) {
      isLoading.value = false;
    }
  };

  const getOptionFromEntity = (
    entity: BaseEntity,
    counts: Map<string, number>,
  ): DropdownOption => {
    const { label: labelPath = "", value: valuePath = "" } =
      filterOptionsMapping.value || {};

    const labelValue = extractValueFromObject(entity, labelPath) as
      | string
      | undefined;
    const valueValue = extractValueFromObject(entity, valuePath) as
      | string
      | undefined;

    const baseOption = {
      icon: DamsIcons.NoIcon,
      label: labelValue || getEntityTitle(entity),
      value: valueValue || entity.id,
    };

    const count = counts.get(baseOption.value);
    if (count !== undefined) {
      baseOption.label = `${baseOption.label} (${count})`;
    }

    return baseOption;
  };

  const getOptionsFromArrayValue = (
    entity: BaseEntity,
    path: string,
    counts: Map<string, number>,
  ): DropdownOption[] => {
    const arrayValue = extractValueFromObject(entity, path);
    if (!Array.isArray(arrayValue)) {
      return [getOptionFromEntity(entity, counts)];
    }

    return arrayValue.map((item) => {
      const baseOption = {
        icon: DamsIcons.NoIcon,
        label: item,
        value: item,
      };

      const count = counts.get(baseOption.value);
      if (count !== undefined) {
        baseOption.label = `${baseOption.label} (${count})`;
      }
      return baseOption;
    });
  };

  const getOptionsForEntity = (entity: BaseEntity): DropdownOption[] => {
    const { label: labelPath = "", value: valuePath = "" } =
      filterOptionsMapping.value || {};

    const counts = facetCounts.value;

    if (labelPath === valuePath && labelPath) {
      return getOptionsFromArrayValue(entity, labelPath, counts);
    }

    return [getOptionFromEntity(entity, counts)];
  };

  const options = computed<DropdownOption[]>(() => {
    const opts =
      dropdownOptions.value?.length > 0
        ? dropdownOptions.value
        : optionsLibrary.entities.value?.flatMap(getOptionsForEntity) || [];

    if (hasFacets.value) {
      return opts.filter((option) => {
        const count = facetCounts.value.get(option.value);
        return typeof count === "number" && count > 0;
      });
    }

    return opts;
  });

  const loading = computed<boolean>(() => {
    return (
      isLoading.value ||
      optionsLibrary.entitiesLoading.value ||
      facetsLibrary.entitiesLoading.value
    );
  });

  return {
    init,
    setFilters,
    getOptions,
    getBaseOptions,
    loadOptionsAndFacetsInParallel,
    entities: optionsLibrary.entities,
    entitiesLoading: optionsLibrary.entitiesLoading,
    options,
    dropdownOptions,
    loading,
  };
};
