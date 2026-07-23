<template>
  <div
    v-if="
      paginationLimitOptionsPromiseIsResolved && sortOptionsPromiseIsResolved
    "
    class="flex justify-between items-center w-full"
    :class="[
      { 'flex-wrap': filtersAvailableOnDetailPage },
      { 'flex-nowrap': !filtersAvailableOnDetailPage },
    ]"
  >
    <div
      class="flex flex-col @md:flex-row justify-start gap-3 w-full @md:w-auto"
    >
      <div v-if="paginationLimitOptions.length > 0" class="w-full @md:w-auto">
        <AdvancedDropdown
          class="w-full @md:w-auto"
          v-model="selectedPaginationLimitOption"
          :options="paginationLimitOptions"
          :label="t('library.items')"
          :clearable="false"
          :add-label-to-value="true"
          label-position="inline"
        />
      </div>
      <div v-if="sortOptions.length > 0" class="w-full @md:w-auto">
        <AdvancedDropdown
          class="w-full @md:w-auto"
          data-cy="sort-options"
          v-model="selectedSortOption"
          :options="sortOptions"
          :label="t('library.sort')"
          :clearable="false"
          :add-label-to-value="true"
          label-position="inline"
        />
      </div>
      <div
        v-if="sortOptions.length > 0"
        class="flex items-center w-full @md:w-auto"
      >
        <AdvancedDropdown
          class="w-full @md:w-auto"
          data-cy="sort-toggle"
          v-model="selectedSortDirection"
          :options="sortDirectionOptions"
          :label="t('library.sort-direction')"
          :clearable="false"
          :add-icon-to-value="true"
          label-position="inline"
        />
      </div>
    </div>
    <div v-if="simpleSearchKeys.length > 0" class="w-full @md:w-64">
      <BaseInputTextNumberDatetime
        data-cy="simple-search"
        type="text"
        input-style="defaultWithBorder"
        v-model="simpleSearchInput"
        :placeholder="simpleSearchPlaceholder"
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
  GetPaginationLimitOptionsDocument,
  type GetPaginationLimitOptionsQuery,
} from "@/generated-types/queries";
import { apolloClient } from "@/main";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useStateManagement } from "@/composables/useStateManagement";
import AdvancedDropdown from "@/components/base/AdvancedDropdown.vue";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import { useImport } from "@/composables/useImport";
import debounce from "lodash.debounce";

const props = withDefaults(
  defineProps<{
    setLimit: (limit: number) => void;
    selectedPaginationLimitOption: number;
    setSortKey: (sortKey: string) => void;
    setSortOrder: (sortOrder: boolean, force?: boolean) => void;
    filtersAvailableOnDetailPage?: boolean;
    simpleSearchValue?: string;
    setSimpleSearch?: (value: string) => void;
  }>(),
  {
    selectedPaginationLimitOption: 20,
    filtersAvailableOnDetailPage: false,
    simpleSearchValue: "",
    setSimpleSearch: undefined,
  },
);

const emit = defineEmits<{
  (
    event: "paginationLimitOptionsPromise",
    paginationLimitOptionsPromise: (entityType: Entitytyping) => Promise<void>,
  ): void;
  (
    event: "sortOptionsPromise",
    sortOptionsPromise: (entityType: Entitytyping) => Promise<void>,
  ): void;
}>();

const isAsc = ref<boolean>(false);
const paginationLimitOptions = ref<DropdownOption[]>([]);
const paginationLimitOptionsPromiseIsResolved = ref<boolean>(false);
const selectedPaginationLimitOption = ref<number>(
  props.selectedPaginationLimitOption,
);
const selectedSortOption = ref<any>();
const sortOptions = ref<DropdownOption[]>([]);
const sortOptionsPromiseIsResolved = ref<boolean>(false);
const selectedSortDirection = ref<any>();
const sortDirectionOptions = ref<DropdownOption[]>([
  { label: "library.desc", value: "desc", icon: DamsIcons.SortDown },
  { label: "library.asc", value: "asc", icon: DamsIcons.SortUp },
]);
const { getStateForRoute } = useStateManagement();
const { loadDocument } = useImport();
const { t } = useI18n();
const route = useRoute();

const simpleSearchKeys = computed<string[]>(
  () => (route.meta as any)?.simpleSearch?.keys ?? [],
);
const currentPageLabel = computed<string>(() => {
  const breadcrumbs = (route.meta as any)?.breadcrumbs;
  const lastCrumb = breadcrumbs?.[breadcrumbs.length - 1];
  return lastCrumb?.title ? t(lastCrumb.title) : "";
});
const simpleSearchPlaceholder = computed<string>(() =>
  t("library.simple-search-placeholder", { entity: currentPageLabel.value }),
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

const paginationLimitOptionsPromise = async () => {
  return apolloClient
    .query<GetPaginationLimitOptionsQuery>({
      query: GetPaginationLimitOptionsDocument,
    })
    .then((result) => {
      paginationLimitOptions.value =
        result.data?.PaginationLimitOptions.options || [];

      const state = getStateForRoute(route, true);
      const limit =
        state?.queryVariables?.limit ||
        paginationLimitOptions.value?.[0].value ||
        20;

      selectedPaginationLimitOption.value = paginationLimitOptions.value.find(
        (option) => option.value === limit,
      )?.value;
      props.setLimit(limit);
      paginationLimitOptionsPromiseIsResolved.value = true;
    });
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
      const matchedOption = sortDirectionOptions.value.find(
        (option) => option.value === sortOrder,
      );

      selectedSortDirection.value = matchedOption?.value;
      setIsAsc(sortOrder);
      props.setSortOrder(isAsc.value, false);

      sortOptionsPromiseIsResolved.value = true;
    });
};

const determineSortOptionsQuery = async (): Promise<any> => {
  const queryName = (route?.meta?.queries as any)?.getSortOptions;
  const document = queryName ? await loadDocument(queryName) : undefined;
  return document ?? (await loadDocument("GetSortOptions"));
};

onMounted(() => {
  emit("paginationLimitOptionsPromise", paginationLimitOptionsPromise);
  emit("sortOptionsPromise", sortOptionsPromise);
});

watch(
  () => selectedPaginationLimitOption.value,
  async () =>
    await props.setLimit(
      selectedPaginationLimitOption.value,
      selectedPaginationLimitOption.value !== -1,
    ),
  { deep: true },
);
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
