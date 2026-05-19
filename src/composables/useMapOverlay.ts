import { computed, ref, type ComputedRef } from "vue";
import { SearchInputType } from "@/generated-types/queries";
import { useFiltersBaseNew } from "@/composables/useFiltersBaseNew";
import { useImport } from "@/composables/useImport";
import { apolloClient } from "@/main";

type OverlayWktConfig = {
  query: string;
  filterQuery: string;
  entityType: string;
  wktKey: string;
  label: string;
  hideLabel?: string;
};

export const useMapOverlay = (
  entityId: string,
  mapConfig: ComputedRef<Record<string, any>>,
) => {
  const { loadDocument } = useImport();
  const filtersManager = useFiltersBaseNew();

  const overlayConfig = computed<OverlayWktConfig | undefined>(
    () => mapConfig.value.overlayWkt as OverlayWktConfig | undefined,
  );

  const hasOverlay = computed(() => !!overlayConfig.value?.query);
  const showOverlay = ref(false);
  const overlayWkts = ref<{ wkt: string, id: string }[]>([]);
  const overlayLoading = ref(false);
  const overlayFetched = ref(false);

  const toggleOverlay = async () => {
    showOverlay.value = !showOverlay.value;
    if (!showOverlay.value || overlayFetched.value) return;

    overlayLoading.value = true;
    try {
      const cfg = overlayConfig.value!;

      const filterDocument = await loadDocument(cfg.filterQuery);
      const filterResult = await apolloClient.query({
        query: filterDocument,
        variables: { entityType: cfg.entityType },
        fetchPolicy: "no-cache",
      });

      const rawFilters = filterResult.data?.EntityTypeFilters?.advancedFilters;
      filtersManager.setVariables({ parentIds: [entityId] });
      filtersManager.initializeNewAdvancedFilters(rawFilters);
      const advancedFilterInputs = filtersManager.getNormalizedFiltersForApi();

      const queryDocument = await loadDocument(cfg.query);
      const result = await apolloClient.query({
        query: queryDocument,
        variables: {
          searchValue: {
            value: "",
            isAsc: undefined,
            key: "title",
            order_by: "",
          },
          advancedFilterInputs,
          skip: 1,
          limit: 500,
          advancedSearchValue: [],
          type: cfg.entityType,
          searchInputType: SearchInputType.AdvancedInputType,
        },
        fetchPolicy: "no-cache",
      });

      overlayWkts.value = (result.data?.Entities?.results ?? [])
        .map((e: any) => { return { wkt: e.intialValues?.[cfg.wktKey], id: e.id }; })
        .filter((e: any) => !!e.wkt);
      overlayFetched.value = true;
    } finally {
      overlayLoading.value = false;
    }
  };

  return {
    overlayConfig,
    hasOverlay,
    showOverlay,
    overlayWkts,
    overlayLoading,
    toggleOverlay,
  };
};
