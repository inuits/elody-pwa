<template>
  <div
    data-cy="filters-list-item"
    v-show="!filter.advancedFilter.hidden"
    class="flex relative items-center justify-between px-6 py-4 border-t-2 border-neutral-light cursor-pointer select-none"
    :class="{ 'bg-accent-normal text-neutral-white': filter.isActive }"
    @click="isOpen = !isOpen"
  >
    <div class="flex flex-col">
      <span data-cy="filters-list-item-label" class="text-lg">
        {{ t(filter.advancedFilter.label || "") }}
      </span>
    </div>
    <div class="flex gap-x-2">
      <base-tooltip
        v-if="filter.advancedFilter.tooltip"
        position="top-end"
        :tooltip-offset="8"
      >
        <template #activator="{ on }">
          <div v-on="on">
            <unicon :name="Unicons.QuestionCircle.name" height="20" />
          </div>
        </template>
        <template #default>
          <span class="text-sm text-text-placeholder">
            <div>
              {{
                t(
                  `tooltip.advancedFilterTypes.${props.filter.advancedFilter.type}`
                )
              }}
            </div>
          </span>
        </template>
      </base-tooltip>
      <unicon :name="icon" height="20" />
    </div>
  </div>
  <div
    data-cy="filters-list-item-panel"
    v-show="isOpen"
    class="flex flex-col gap-4 p-6 bg-neutral-light"
  >
    <div class="flex w-full justify-start gap-4">
      <div>
        <BaseDropdownNew
          data-cy="filter-matcher-dropdown"
          class="max-h-9"
          v-model:model-value="selectedMatcher"
          :options="matchers"
          :default-option="filter.selectedMatcher"
          label-position="inline"
          :default-label="t('filters.matcher-labels.select-filter-type')"
          dropdown-style="default"
        />
      </div>
      <div class="flex-grow"></div>
      <BaseButtonNew
        class="!w-9 h-9"
        label=""
        :icon="DamsIcons.Cross"
        :icon-height="22"
        :disabled="!selectedMatcher"
        button-style="accentNormal"
        button-size="small"
        @click="
          () => {
            emit('deactivateFilter', advancedFilterInput.key, true);
            reloadMatcherComponent();
          }
        "
      />
    </div>
    <component
      v-if="selectedMatcher"
      :is="matcherComponent"
      :filter="filter"
      :related-active-filter="relatedActiveFilter"
      @new-advanced-filter-input="(input: AdvancedFilterInput) => advancedFilterInput = input"
      @filter-options="(options: string[]) => (filterOptions = options)"
    />
  </div>
</template>

<script lang="ts" setup>
import type { FilterListItem } from "@/composables/useStateManagement";
import type {
  AdvancedFilterInput,
  DropdownOption,
  InputMaybe,
} from "@/generated-types/queries";
import {
  BulkOperationsContextEnum,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import BaseDropdownNew from "@/components/base/BaseDropdownNew.vue";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import { AdvancedFilterTypes, DamsIcons } from "@/generated-types/queries";
import { computed, markRaw, onMounted, ref, toRefs, watch } from "vue";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";
import isEqual from "lodash.isequal";

enum Matchers {
  EXACT_MATCHER = "ExactMatcher",
  CONTAINS_MATCHERS = "ContainsMatcher",
  ANY_MATCHER = "AnyMatcher",
  NONE_MATCHER = "NoneMatcher",
}

const props = withDefaults(
  defineProps<{
    filter: FilterListItem;
    matchers: DropdownOption[];
    clearAllActiveFilters: boolean;
    relatedActiveFilter: string[];
  }>(),
  {
    relatedActiveFilter: () => [],
  }
);

const emit = defineEmits<{
  (
    event: "activateFilter",
    advancedFilterInput: AdvancedFilterInput,
    selectedMatcher: DropdownOption | undefined
  ): void;
  (
    event: "deactivateFilter",
    advancedFilterKey: string | InputMaybe<string> | undefined,
    forceApply: Boolean | undefined
  ): void;
}>();

const { t } = useI18n();
const { dequeueItemForBulkProcessing } = useBulkOperations();
const { matchers, clearAllActiveFilters } = toRefs(props);
const isOpen = ref<boolean>(props.filter.isActive || false);
const matcherComponent = ref();
const selectedMatcher = ref<DropdownOption>();
const advancedFilterInput = ref<AdvancedFilterInput>({
  type: props.filter.advancedFilter.type,
  key: props.filter.advancedFilter.key,
  value: undefined,
});
const filterOptions = ref<string[]>([]);

const loadMatcher = async () => {
  let matcher = selectedMatcher.value?.value;
  if (matcher === "MetadataOnRelationExactMatcher") matcher = "ExactMatcher";
  else if (matcher === "MetadataOnRelationContainsMatcher")
    matcher = "ContainsMatcher";

  if (!matcher) return;

  try {
    const module = await import(`@/components/filters/matchers/${matcher}.vue`);
    matcherComponent.value = markRaw(module.default);
  } catch (e) {
    console.info(`Matcher with name '${matcher}' could not be loaded `);
  }
};

const icon = computed<string>(() =>
  isOpen.value ? Unicons.Minus.name : Unicons.Plus.name
);

const defaultMatcherMap: Partial<Record<AdvancedFilterTypes, string>> = {
  [AdvancedFilterTypes.Selection]: Matchers.EXACT_MATCHER,
  [AdvancedFilterTypes.Text]: Matchers.CONTAINS_MATCHERS,
};

const reloadMatcherComponent = () => {
  matcherComponent.value = undefined;
  loadMatcher();
};

const getDefaultMatcher = () => {
  return matchers.value.find(
    (matcher) =>
      matcher.value === defaultMatcherMap[advancedFilterInput.value.type]
  );
};

onMounted(() => {
  const defaultMatcher = props.filter.selectedMatcher || getDefaultMatcher();

  if (defaultMatcher && !selectedMatcher.value)
    selectedMatcher.value = defaultMatcher;
});

watch(selectedMatcher, async (newValue, oldValue) => {
  if (oldValue !== undefined)
    emit("deactivateFilter", advancedFilterInput.value.key);
  if (selectedMatcher.value) await loadMatcher();

  filterOptions.value.forEach((option) =>
    dequeueItemForBulkProcessing(
      BulkOperationsContextEnum.FilterOptions,
      option
    )
  );
});

watch(advancedFilterInput, (newValue, oldValue) => {
  if (Array.isArray(advancedFilterInput.value.value)) {
    if (
      Array.isArray(oldValue?.value) !== Array.isArray(newValue?.value) ||
      oldValue?.value.length === 0 ||
      newValue?.value.length === 0
    ) {
      oldValue = Array.isArray(oldValue?.value)
        ? oldValue?.value[0]
        : oldValue?.value;
      newValue = Array.isArray(newValue?.value)
        ? newValue?.value[0]
        : newValue?.value;
    } else {
      oldValue = oldValue?.value;
      newValue = newValue?.value;
    }

    if (isEqual(newValue, oldValue)) return;
    if (advancedFilterInput.value.value.length > 0)
      emit("activateFilter", advancedFilterInput.value, selectedMatcher.value);
    else emit("deactivateFilter", advancedFilterInput.value.key);
  } else {
    if (newValue?.value === oldValue?.value) return;
    if (advancedFilterInput.value.value !== undefined)
      emit("activateFilter", advancedFilterInput.value, selectedMatcher.value);
    else emit("deactivateFilter", advancedFilterInput.value.key);
  }
});
watch(clearAllActiveFilters, () => {
  if (clearAllActiveFilters.value) {
    isOpen.value = false;
    const matchersToResetToDefault = [
      Matchers.ANY_MATCHER,
      Matchers.NONE_MATCHER,
    ];
    const matcher = selectedMatcher.value?.value;
    if (!matchersToResetToDefault.includes(matcher))
      return reloadMatcherComponent();

    const defaultMatcher = getDefaultMatcher();
    if (!defaultMatcher) return;

    selectedMatcher.value = defaultMatcher;
  }
});
</script>
