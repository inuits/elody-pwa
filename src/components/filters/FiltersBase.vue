<template>
  <div
    class="relative h-full bg-neutral-white w-full"
    :class="expandFilters ? 'rounded-t' : 'rounded-xl'"
    @keydown.enter="applyFilters()"
  >
    <div
      class="flex justify-between items-center px-4 h-12 border-t border-x select-none cursor-pointer"
      :class="
        expandFilters
          ? 'border-neutral-light rounded-t'
          : 'border-neutral-white rounded-xl'
      "
      @click="() => emit('expandFilters', expandFilters)"
    >
      <span class="text-text-body text-xl font-bold">
        {{ t("filters.filter") }}
      </span>
      <div class="flex">
        <span class="text-text-body">
          {{ activeFilterCount }} {{ t("filters.active") }}
        </span>
        <unicon
          class="text-text-body ml-4"
          :name="Unicons[getAngleIcon].name"
        />
      </div>
    </div>

    <div
      class="absolute w-full rounded-b bg-neutral-white"
      :class="
        expandFilters
          ? 'scrollable border-x border-b-2 border-neutral-light'
          : ''
      "
    >
      <div v-if="expandFilters" class="p-4">
        <div class="flex justify-between gap-4 pb-4">
          <BaseButtonNew
            class="!w-1/3"
            :label="t('filters.clear')"
            button-style="default"
            @click="() => (clearAllActiveFilters = true)"
          />
          <BaseButtonNew
            :label="t('filters.apply')"
            button-style="accentNormal"
            @click="applyFilters()"
          />
        </div>
        <div>
          <BaseInputAutocomplete
            v-model="displayedFilterOptions"
            :options="
              filters
                .filter((filter) => !filter.advancedFilter.isDisplayedByDefault)
                .filter((filter) => !filter.advancedFilter.hidden)
                .filter((filter) => filter.advancedFilter.label)
                .map((filter) => {
                  return {
                    label: t(filter.advancedFilter.label || ''),
                    value: t(filter.advancedFilter.label || ''),
                  };
                })
            "
            :placeholder="t('filters.add-filter')"
            autocomplete-style="defaultWithBorder"
          />
        </div>
      </div>

      <div v-if="expandFilters && matchers.length > 0">
        <FiltersListItem
          v-for="filter in filters.filter((filter) => filter.isDisplayed)"
          :key="filter.advancedFilter.key || ''"
          :filter="filter"
          :matchers="
            matchers.filter((option) =>
              filterMatcherMapping[filter.advancedFilter.type].includes(
                option.value
              )
            )
          "
          :clear-all-active-filters="clearAllActiveFilters"
          @activate-filter="(filter: AdvancedFilterInput) => {
            activeFilters = activeFilters.filter(activeFilter => activeFilter.key !== filter.key);
            activeFilters.push(filter);
          }"
          @deactivate-filter="
            (key) =>
              (activeFilters = activeFilters.filter(
                (filter) => filter.key !== key
              ))
          "
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  DamsIcons,
  type AdvancedFilter,
  type AdvancedFilterInput,
  type AdvancedFilters,
  type DropdownOption,
  type FilterMatcherMap,
  type Maybe,
} from "@/generated-types/queries";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import BaseInputAutocomplete from "@/components/base/BaseInputAutocomplete.vue";
import FiltersListItem from "@/components/filters/FiltersListItem.vue";
import useEditMode from "@/composables/useEdit";
import { computed, defineProps, ref, toRefs, watch } from "vue";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";

export type FilterListItem = {
  isActive: boolean;
  isDisplayed: boolean;
  advancedFilter: AdvancedFilter;
};

const props = withDefaults(
  defineProps<{
    filterMatcherMapping: FilterMatcherMap;
    advancedFilters: Maybe<AdvancedFilters> | undefined;
    entityType: string;
    expandFilters: boolean;
    parentEntityIdentifiers?: string[];
    filtersBaseInitializationStatus:
      | "not-initialized"
      | "inProgress"
      | "initialized";
  }>(),
  {
    parentEntityIdentifiers: () => [],
  }
);

const emit = defineEmits<{
  (event: "applyFilters", advancedFilterInputs: AdvancedFilterInput[]): void;
  (event: "expandFilters", expandFilters: boolean): void;
}>();

const { entityType, filtersBaseInitializationStatus } = toRefs(props);
const { isSaved } = useEditMode();
const { t } = useI18n();
const matchers = ref<DropdownOption[]>([]);
const filters = ref<FilterListItem[]>([]);
const displayedFilterOptions = ref<DropdownOption[]>([]);
const activeFilters = ref<AdvancedFilterInput[]>([]);
const activeFilterCount = ref<number>(0);
const clearAllActiveFilters = ref<boolean>(false);

const applyFilters = () => {
  emit("applyFilters", activeFilters.value);
};

const getAngleIcon = computed<DamsIcons>(() =>
  props.expandFilters ? DamsIcons.AngleUp : DamsIcons.AngleDown
);

const handleFilterMatcherMapping = () => {
  const matcherSet = new Set<string>();
  Object.values(props.filterMatcherMapping).forEach((matcherArray) => {
    if (typeof matcherArray !== "string")
      for (const matcher of matcherArray) matcherSet.add(matcher);
  });

  matchers.value = Array.from(matcherSet).map((matcher) => {
    return {
      icon: DamsIcons.NoIcon,
      label: t(`filters.matcher-labels.${matcher}`),
      value: matcher,
    };
  });
};

const handleAdvancedFilters = () => {
  if (!props.advancedFilters) return;
  filters.value = [];
  activeFilters.value = [];

  Object.values(props.advancedFilters).forEach((advancedFilter) => {
    if (typeof advancedFilter !== "string") {
      if (advancedFilter.hidden) {
        const hiddenFilter: AdvancedFilterInput = {
          type: advancedFilter.type,
          parent_key: advancedFilter.parentKey,
          key: advancedFilter.key,
          value: advancedFilter.defaultValue,
          match_exact: true,
        };

        if (advancedFilter.parentKey === "relations") {
          if (props.parentEntityIdentifiers.length > 0) {
            hiddenFilter.value = props.parentEntityIdentifiers;
            activeFilters.value.push(hiddenFilter);
          }
        } else activeFilters.value.push(hiddenFilter);
      }

      filters.value.push({
        isActive: !!advancedFilter.hidden,
        isDisplayed: advancedFilter.isDisplayedByDefault ?? false,
        advancedFilter,
      });
    }
  });

  if (entityType.value || props.parentEntityIdentifiers.length > 0)
    applyFilters();
};

const toggleDisplayedFilters = () => {
  filters.value.forEach((filter) => {
    filter.isDisplayed =
      displayedFilterOptions.value
        .map((option) => option.label)
        .includes(t(filter.advancedFilter.label || "")) ||
      !!filter.advancedFilter.isDisplayedByDefault;
  });
};

if (props.parentEntityIdentifiers.length > 0)
  watch(
    () => isSaved.value,
    () => {
      if (isSaved.value) applyFilters();
    }
  );
watch(
  () => filtersBaseInitializationStatus.value,
  () => {
    if (filtersBaseInitializationStatus.value === "initialized") {
      handleFilterMatcherMapping();
      handleAdvancedFilters();
    }
  }
);
watch(displayedFilterOptions, () => toggleDisplayedFilters());
watch(activeFilters, () => {
  activeFilterCount.value = 0;

  filters.value.forEach((filter) => {
    filter.isActive = activeFilters.value
      .map((activeFilter) => activeFilter.key)
      .includes(filter.advancedFilter.key);
    if (filter.advancedFilter.hidden) return;
    activeFilterCount.value += filter.isActive ? 1 : 0;
  });
});
watch(clearAllActiveFilters, () => {
  if (clearAllActiveFilters.value) {
    let displayedFilterOption: DropdownOption | undefined = {
      label: "",
      value: "",
    };
    while (displayedFilterOption !== undefined)
      displayedFilterOption = displayedFilterOptions.value.pop();
    toggleDisplayedFilters();

    activeFilters.value = activeFilters.value.filter((activeFilter) =>
      filters.value
        .filter((filter) => !!filter.advancedFilter.hidden)
        .map((filter) => filter.advancedFilter.key)
        .includes(activeFilter.key)
    );
    setTimeout(() => (clearAllActiveFilters.value = false), 50);
    applyFilters();
  }
});
</script>

<style>
.scrollable {
  overflow-y: auto;
  height: 70vh;
}
</style>
