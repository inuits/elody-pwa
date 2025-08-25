<template>
  <div v-show="!filter.advancedFilter.hidden">
    <FiltersListItemHeader
      :is-active="filter.isActive"
      :label="filterLabel"
      :tooltip="filter.advancedFilter.tooltip"
      :tooltip-text="tooltipText"
      :icon="headerIcon"
      @toggle="toggleOpen"
    />

    <FiltersListItemPanel
      v-show="isOpen"
      :matchers="filterMatchers"
      :selected-matcher="selectedMatcher"
      :default-label="matcherDefaultLabel"
      @update:selected-matcher="updateSelectedMatcher"
      @reset="resetFilter"
    >
      <component
        v-if="selectedMatcher"
        ref="matcherComponentRef"
        :is="matcherComponent"
        :filter="filter"
        :last-typed-value="lastTypedValue"
        :is-open="isOpen"
        :getNormalizedActiveFilters="getNormalizedActiveFilters"
        :refetchFilterOptions="refetchFilterOptions || clearAllActiveFilters"
        @new-input-value="updateLastTypedValue"
        @filter-options="updateFilterOptions"
        @updateValue="updateFilterValue"
      />
    </FiltersListItemPanel>
  </div>
</template>

<script lang="ts" setup>
import type { FilterListItem } from "@/composables/useStateManagement";
import type { DropdownOption } from "@/generated-types/queries";
import { AdvancedFilterTypes, Matchers } from "@/generated-types/queries";
import {
  useBulkOperations,
  BulkOperationsContextEnum,
} from "@/composables/useBulkOperations";
import { computed, markRaw, onBeforeMount, ref, watch } from "vue";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";
import isEqual from "lodash.isequal";
import FiltersListItemPanel from "@/components/filters/FiltersListItemPanel.vue";
import FiltersListItemHeader from "@/components/filters/FiltersListItemHeader.vue";

interface Props {
  filter: FilterListItem;
  matchers: DropdownOption[];
  clearAllActiveFilters: boolean;
  getNormalizedActiveFilters: () => any;
  refetchFilterOptions: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (
    e: "activateFilter",
    key: string | string[],
    input: any,
    matcher?: DropdownOption,
  ): void;
  (e: "deactivateFilter", key: string, forceApply?: boolean): void;
}>();

const { t } = useI18n();
const { dequeueItemForBulkProcessing } = useBulkOperations();
const isOpen = ref(props.filter.isActive);
const matcherComponent = ref();
const selectedMatcher = ref<string>();
const filterOptions = ref<string[]>([]);
const lastTypedValue = ref<string>("");
const matcherComponentRef = ref();

const filterLabel = computed(() => t(props.filter.advancedFilter.label || ""));
const tooltipText = computed(() =>
  t(`tooltip.advancedFilterTypes.${props.filter.advancedFilter.type}`),
);
const headerIcon = computed(() =>
  isOpen.value ? Unicons.Minus.name : Unicons.Plus.name,
);
const filterMatchers = computed(() => props.matchers);
const matcherDefaultLabel = computed(() =>
  t("filters.matcher-labels.select-filter-type"),
);
const defaultMatcher = computed(
  () => props.filter.selectedMatcher || getDefaultMatcher(),
);

const loadMatcher = async () => {
  if (!selectedMatcher.value) return;

  try {
    const matcher = selectedMatcher.value;

    const module = await import(`@/components/filters/matchers/${matcher}.vue`);
    matcherComponent.value = markRaw(module.default);
  } catch (e) {
    console.error(`Matcher '${selectedMatcher.value}' could not be loaded`, e);
  }
};

const getDefaultMatcher = (): string | undefined => {
  const defaultMatchers: { [type: string]: string } = {
    [AdvancedFilterTypes.Selection]: Matchers.ExactMatcher,
    [AdvancedFilterTypes.Text]: Matchers.ContainsMatcher,
    [AdvancedFilterTypes.Boolean]: Matchers.ExactMatcher,
    [AdvancedFilterTypes.Date]: Matchers.ExactMatcher,
    [AdvancedFilterTypes.Number]: Matchers.ExactMatcher,
  };

  const matcherName = defaultMatchers[props.filter.advancedFilter.type];
  return props.matchers.find((m) => m.value === matcherName)?.value;
};

const updateSelectedMatcher = (matcher: string) => {
  selectedMatcher.value = matcher;
};

const resetFilter = () => {
  lastTypedValue.value = "";
  emit("deactivateFilter", props.filter.advancedFilter.key, true);

  if (matcherComponentRef.value) {
    matcherComponentRef.value.reset();
  }

  const defaultMatcherValue = getDefaultMatcher();

  const isNeutralMatcher = [Matchers.AnyMatcher, Matchers.NoneMatcher].includes(
    selectedMatcher.value,
  );

  const shouldUpdateToDefault =
    defaultMatcherValue && defaultMatcherValue !== selectedMatcher.value;

  if (isNeutralMatcher || shouldUpdateToDefault) {
    selectedMatcher.value = defaultMatcherValue;
    return;
  }
};

const updateLastTypedValue = (value: string) => {
  lastTypedValue.value = value;
};

const updateFilterOptions = (options: string[]) => {
  filterOptions.value = options;
  options.forEach((option) =>
    dequeueItemForBulkProcessing(
      BulkOperationsContextEnum.FilterOptions,
      option,
    ),
  );
};

const toggleOpen = () => {
  isOpen.value = !isOpen.value;
};

watch(selectedMatcher, async (newVal, oldVal) => {
  if (oldVal !== undefined) {
    emit("deactivateFilter", props.filter.advancedFilter.key);
    lastTypedValue.value = "";
  }

  if (newVal) {
    await loadMatcher();
  }
});

const updateFilterValue = (value: unknown) => {
  if (typeof value === "string") updateLastTypedValue(value);
  if (isEqual(value, props.filter.inputFromState?.value)) return;

  const isEmpty =
    value === "" ||
    value === null ||
    value === undefined ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "object" &&
      value !== null &&
      Object.keys(value).length === 0);

  if (isEmpty) {
    emit("deactivateFilter", props.filter.advancedFilter.key);
  } else {
    emit(
      "activateFilter",
      props.filter.advancedFilter.key,
      value,
      selectedMatcher.value,
    );
  }
};

watch(
  () => props.clearAllActiveFilters,
  (shouldClear) => {
    if (shouldClear) {
      isOpen.value = false;
      resetFilter();
    }
  },
);

onBeforeMount(() => {
  if (defaultMatcher.value && !selectedMatcher.value) {
    selectedMatcher.value = defaultMatcher.value;
    loadMatcher();
  }
});
</script>
