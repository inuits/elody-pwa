<template>
  <div
    :class="isCompact ? 'contents' : 'flex flex-wrap items-center justify-end gap-2'"
  >
    <!-- ui_kits/vlacc: search, page size, sort and direction together on the
         right of the band, wrapping as one group; a small screen gives the
         search the band's first row -->
    <BaseSearchPill
      v-if="
        sortOptionsPromiseIsResolved &&
        simpleSearchKeys.length > 0 &&
        setSimpleSearch
      "
      :class="isCompact ? 'basis-full order-first' : 'w-64'"
      data-cy="simple-search"
      v-model="simpleSearchInput"
      :label="t('library.search-in-results')"
      :placeholder="t('library.search-in-results')"
    />
    <template v-if="isCompact">
      <!-- one button for sort field and direction; it opens a bottom sheet -->
      <button
        v-if="sortOptionsPromiseIsResolved"
        ref="sortSheetToggle"
        type="button"
        data-cy="sort-sheet-toggle"
        aria-haspopup="dialog"
        :aria-expanded="sortSheetOpen ? 'true' : 'false'"
        class="flex flex-1 min-w-0 self-stretch items-center gap-1.5 px-2.5 border border-border-default rounded-input bg-surface text-ui cursor-pointer"
        @click="openSortSheet"
      >
        <unicon
          height="18"
          aria-hidden="true"
          class="shrink-0"
          :name="
            Unicons[selectedSortDirection === 'asc' ? DamsIcons.SortUp : DamsIcons.SortDown].name
          "
        />
        <span class="flex-1 truncate text-left font-bold">{{
          selectedSortLabel
        }}</span>
        <unicon
          height="18"
          aria-hidden="true"
          class="shrink-0"
          :name="Unicons.AngleDown.name"
        />
      </button>
      <Teleport defer :to="someModalIsOpened ? modalTeleportTarget() : 'body'">
        <div
          v-show="sortSheetOpen"
          class="fixed inset-0 z-context-menu bg-scrim"
          @click="closeSortSheet"
        />
        <!-- v-show: the page size inside registers the first fetch's promise -->
        <div
          v-show="sortSheetOpen"
          ref="sortSheet"
          data-cy="sort-sheet"
          role="dialog"
          aria-modal="true"
          :aria-label="t('library.sort')"
          class="fixed inset-x-0 bottom-0 z-context-menu flex flex-col gap-1 max-h-[85dvh] overflow-y-auto bg-surface rounded-t-(--sheet-radius) p-(--sheet-padding) shadow-(--shadow-overlay) text-value"
          @keydown.esc="closeSortSheet"
        >
          <span class="px-2 py-1 font-bold">{{ t("library.sort") }}</span>
          <button
            v-for="option in sortOptions"
            :key="option.value"
            type="button"
            data-cy="sort-sheet-option"
            :aria-pressed="option.value === selectedSortOption ? 'true' : 'false'"
            class="flex items-center justify-between min-h-(--touch-target-min) px-2 rounded-card text-left cursor-pointer hover:bg-surface-row-hover"
            :class="{ 'font-bold': option.value === selectedSortOption }"
            @click="pickSortOption(option.value)"
          >
            {{ t(option.label) }}
            <unicon
              v-if="option.value === selectedSortOption"
              height="20"
              aria-hidden="true"
              class="fill-accent"
              :name="Unicons.Check.name"
            />
          </button>
          <div
            role="group"
            :aria-label="t('library.sort-direction')"
            class="grid grid-cols-2 h-(--touch-target-min) mx-2 mt-2 border border-border-default rounded-input overflow-hidden"
          >
            <button
              v-for="direction in ['asc', 'desc'] as const"
              :key="direction"
              type="button"
              :data-cy="`sort-sheet-${direction}`"
              :aria-pressed="selectedSortDirection === direction ? 'true' : 'false'"
              class="flex items-center justify-center gap-1.5 font-bold cursor-pointer"
              :class="pressedStyles[selectedSortDirection === direction ? 'on' : 'off']"
              @click="selectedSortDirection = direction"
            >
              <unicon
                height="16"
                aria-hidden="true"
                :name="Unicons[direction === 'asc' ? DamsIcons.SortUp : DamsIcons.SortDown].name"
              />
              {{ t(`library.${direction}`) }}
            </button>
          </div>
          <slot />
          <div
            v-if="showGroupBy && groupByHasOptions"
            role="group"
            :aria-label="t('library.group-by')"
            class="flex flex-col gap-2 px-2 pt-3"
          >
            <span class="text-label font-bold text-text-light uppercase">{{
              t("library.group-by")
            }}</span>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="option in groupByDropdownOptions"
                :key="option.value"
                type="button"
                data-cy="group-by-chip"
                :aria-pressed="option.value === selectedGroupByKey ? 'true' : 'false'"
                class="min-h-9 px-3.5 border rounded-pill font-bold cursor-pointer"
                :class="pressedStyles[option.value === selectedGroupByKey ? 'on' : 'off']"
                @click="selectGroupBy(String(option.value ?? ''))"
              >
                {{ t(option.label) }}
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </template>
    <!-- the page size; it registers the promise the first fetch waits for, so
         it isn't gated on the sort options -->
    <slot v-else />
    <template
      v-if="!isCompact && sortOptionsPromiseIsResolved && sortOptions.length > 0"
    >
      <AdvancedDropdown
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
    </template>
    <AdvancedDropdown
      v-if="
        !isCompact &&
        sortOptionsPromiseIsResolved &&
        showGroupBy &&
        groupByHasOptions
      "
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
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useStateManagement } from "@/composables/useStateManagement";
import AdvancedDropdown from "@/components/base/AdvancedDropdown.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import BaseSearchPill from "@/components/base/BaseSearchPill.vue";
import { useImport } from "@/composables/useImport";
import { useGroupByOptions } from "@/composables/useGroupByOptions";
import debounce from "lodash.debounce";
import { trackSort } from "@/analytics/usageAnalytics";
import { isCompact } from "@/composables/useNavMenu";
import { useBaseModal } from "@/composables/useBaseModal";
import { modalTeleportTarget } from "@/composables/useModalTeleportTarget";
import { Unicons } from "@/types";

const props = withDefaults(
  defineProps<{
    setSortKey: (sortKey: string) => void;
    setSortOrder: (sortOrder: boolean, force?: boolean) => void;
    simpleSearchValue?: string;
    setSimpleSearch?: (value: string) => void;
    showGroupBy?: boolean;
    setGroupBy?: (config: GroupByConfig | null) => void;
  }>(),
  {
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

const { someModalIsOpened } = useBaseModal();
const sortSheetOpen = ref(false);
const sortSheet = ref<HTMLElement>();
const sortSheetToggle = ref<HTMLElement>();
const pressedStyles = {
  on: "bg-accent-wash text-accent-ink border-accent",
  off: "bg-surface border-border-default",
};
const selectedSortLabel = computed(() => {
  const label = sortOptions.value.find(
    (option) => option.value === selectedSortOption.value,
  )?.label;
  return t(label ?? "library.sort");
});
const openSortSheet = async () => {
  sortSheetOpen.value = true;
  await nextTick();
  sortSheet.value?.querySelector<HTMLElement>("button")?.focus();
};
const closeSortSheet = () => {
  sortSheetOpen.value = false;
  sortSheetToggle.value?.focus();
};
const pickSortOption = (sortKey: string) => {
  selectedSortOption.value = sortKey;
  trackSort(sortKey, route.meta?.entityType as string);
  closeSortSheet();
};

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
