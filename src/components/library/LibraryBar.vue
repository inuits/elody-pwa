<template>
  <div
    v-if="sortOptionsPromiseIsResolved"
    class="flex justify-between items-center w-full"
    :class="[
      { 'flex-wrap': filtersAvailableOnDetailPage },
      { 'flex-nowrap': !filtersAvailableOnDetailPage },
    ]"
  >
    <div
      class="flex flex-col @md:flex-row justify-start gap-3 w-full @md:w-auto"
    >
      <div v-if="sortOptions.length > 0" class="w-full @md:w-auto">
        <AdvancedDropdown
          class="w-full @md:w-auto"
          data-cy="sort-options"
          v-model="selectedSortOption"
          @update:model-value="(sort: string) => trackSort(sort, route.meta?.entityType as string)"
          :options="sortOptions"
          :label="t('library.sort')"
          :clearable="false"
          :add-label-to-value="true"
          label-position="inline"
          style-type="defaultWithBorder"
        />
      </div>
      <div
        v-if="sortOptions.length > 0"
        class="flex items-center w-full @md:w-auto"
      >
        <!-- ui_kits/clients: one "⇅ Descending" toggle, not a dropdown. -->
        <BaseButtonNew
          class="!w-auto min-h-8"
          data-cy="sort-toggle"
          button-size="md"
          :icon="selectedSortDirection === 'asc' ? DamsIcons.SortUp : DamsIcons.SortDown"
          :label="t(selectedSortDirection === 'asc' ? 'library.asc' : 'library.desc')"
          :aria-label="`${t('library.sort-direction')}: ${t(selectedSortDirection === 'asc' ? 'library.asc' : 'library.desc')}`"
          @click="
            selectedSortDirection =
              selectedSortDirection === 'asc' ? 'desc' : 'asc'
          "
        />
      </div>
      <div
        v-if="showGroupBy && groupByHasOptions"
        class="w-full @md:w-auto"
      >
        <AdvancedDropdown
          class="w-full @md:w-auto"
          data-cy="group-by-options"
          :model-value="selectedGroupByKey"
          :options="groupByDropdownOptions"
          :label="t('library.group-by')"
          :clearable="false"
          :add-label-to-value="true"
          label-position="inline"
          style-type="defaultWithBorder"
          @update:model-value="(value) => selectGroupBy(String(value ?? ''))"
        />
      </div>
    </div>
    <div
      v-if="simpleSearchKeys.length > 0 && setSimpleSearch"
      class="w-full @md:w-64"
    >
      <BaseSearchPill
        data-cy="simple-search"
        v-model="simpleSearchInput"
        :label="t('library.search-in-results')"
        :placeholder="t('library.search-in-results')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRoute } from "vue-router";
import {
  DamsIcons,
  type DropdownOption,
  type Entitytyping,
  type GroupByConfig,
} from "@/generated-types/queries";
import { apolloClient } from "@/main";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useStateManagement } from "@/composables/useStateManagement";
import AdvancedDropdown from "@/components/base/AdvancedDropdown.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import BaseSearchPill from "@/components/base/BaseSearchPill.vue";
import { useImport } from "@/composables/useImport";
import { useGroupByOptions } from "@/composables/useGroupByOptions";
import debounce from "lodash.debounce";
import { trackSort } from "@/analytics/usageAnalytics";

const props = withDefaults(
  defineProps<{
    setSortKey: (sortKey: string) => void;
    setSortOrder: (sortOrder: boolean, force?: boolean) => void;
    filtersAvailableOnDetailPage?: boolean;
    simpleSearchValue?: string;
    setSimpleSearch?: (value: string) => void;
    showGroupBy?: boolean;
    setGroupBy?: (config: GroupByConfig | null) => void;
  }>(),
  {
    filtersAvailableOnDetailPage: false,
    simpleSearchValue: "",
    setSimpleSearch: undefined,
    showGroupBy: false,
    setGroupBy: undefined,
  },
);

const emit = defineEmits<{
  (
    event: "sortOptionsPromise",
    sortOptionsPromise: (entityType: Entitytyping) => Promise<void>,
  ): void;
}>();

const isAsc = ref<boolean>(false);
const selectedSortOption = ref<any>();
const sortOptions = ref<DropdownOption[]>([]);
const sortOptionsPromiseIsResolved = ref<boolean>(false);
const selectedSortDirection = ref<"asc" | "desc">();
const { getStateForRoute } = useStateManagement();
const { loadDocument } = useImport();
const { t } = useI18n();
const route = useRoute();

const simpleSearchKeys = computed<string[]>(
  () => (route.meta as any)?.simpleSearch?.keys ?? [],
);
const simpleSearchInput = ref<string>(props.simpleSearchValue);
const debouncedSetSimpleSearch = debounce(
  (value: string) => props.setSimpleSearch?.(value),
  250,
);

watch(
  () => props.simpleSearchValue,
  (value) => {
    if (value !== simpleSearchInput.value) simpleSearchInput.value = value;
  },
);
watch(simpleSearchInput, (value) => {
  if (value === props.simpleSearchValue) return;
  debouncedSetSimpleSearch(value);
});

onUnmounted(() => debouncedSetSimpleSearch.cancel());

const setIsAsc = (sortDirection: "asc" | "desc") => {
  isAsc.value = sortDirection === "asc";
};

const sortOptionsPromise = async (entityType: Entitytyping) => {
  return apolloClient
    .query({
      query: await determineSortOptionsQuery(),
      variables: { entityType },
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
    })
    .then((result) => {
      const sortingOptionsResult =
        result.data?.EntityTypeSortOptions.sortOptions;

      sortOptions.value = sortingOptionsResult?.options || [];

      sortOptions.value = sortOptions.value.filter((option) => {
        const availabilityArray = option.availableInPages;
        if (!availabilityArray) return true;
        const isAvailable = availabilityArray.reduce(
          (accumulator, currentValue) => {
            if (
              route.fullPath.includes(currentValue.entityType) &&
              currentValue.routeName === route.name
            )
              return true;
            return accumulator;
          },
          false,
        );
        return isAvailable;
      });

      const state = getStateForRoute(route, true);

      const stateSortKey = state?.queryVariables?.searchValue?.order_by;
      const defaultSortKey = sortOptions.value?.[0]?.value;
      const finalSortKey = stateSortKey || defaultSortKey;
      selectedSortOption.value = sortOptions.value.find(
        (option) => option.value === finalSortKey,
      )?.value;

      props.setSortKey(finalSortKey);

      const stateIsAsc = state?.queryVariables?.searchValue?.isAsc;
      const apiIsAsc = sortingOptionsResult?.isAsc?.toLowerCase() === "asc";

      const isAscFromState = stateIsAsc !== undefined ? stateIsAsc : apiIsAsc;

      const sortOrder = isAscFromState ? "asc" : "desc";
      selectedSortDirection.value = sortOrder;
      setIsAsc(sortOrder);
      props.setSortOrder(isAsc.value, false);

      sortOptionsPromiseIsResolved.value = true;
    });
};

const {
  hasOptions: groupByHasOptions,
  dropdownOptions: groupByDropdownOptions,
  selectedKey: selectedGroupByKey,
  setOptions: setGroupByOptions,
  select: selectGroupBy,
  clear: clearGroupByOptions,
} = useGroupByOptions({
  onChange: (config) => props.setGroupBy?.(config),
});

let groupByOptionsRequest = 0;
const loadGroupByOptions = async () => {
  const request = ++groupByOptionsRequest;
  clearGroupByOptions();
  const queryName = (route?.meta?.queries as any)?.getGroupByOptions;
  if (!queryName) return;
  const result = await apolloClient.query({
    query: await loadDocument(queryName),
    variables: { entityType: route.meta?.entityType },
    fetchPolicy: "no-cache",
  });
  if (request !== groupByOptionsRequest) return;
  setGroupByOptions(
    (result.data?.EntityTypeGroupByOptions?.options ?? []) as GroupByConfig[],
  );
};

const determineSortOptionsQuery = async (): Promise<any> => {
  const queryName = (route?.meta?.queries as any)?.getSortOptions;
  const document = queryName ? await loadDocument(queryName) : undefined;
  return document ?? (await loadDocument("GetSortOptions"));
};

onMounted(() => {
  emit("sortOptionsPromise", sortOptionsPromise);
});

watch(() => route.name, loadGroupByOptions, { immediate: true });

watch(
  () => selectedSortOption.value,
  async () => await props.setSortKey(selectedSortOption.value, true),
  { deep: true },
);
watch(
  () => selectedSortDirection.value,
  async () => setIsAsc(selectedSortDirection.value),
  { deep: true },
);
watch(
  () => isAsc.value,
  async () => {
    await props.setSortOrder(isAsc.value, true);
  },
);
</script>
