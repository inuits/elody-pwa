<template>
  <div
    v-show="!filter.advancedFilter.hidden"
    class="flex relative items-center justify-between px-6 py-4 border-t-2 border-neutral-light cursor-pointer select-none"
    :class="{ 'bg-accent-normal text-neutral-white': filter.isActive }"
    @click="isOpen = !isOpen"
  >
    <div class="flex flex-col">
      <span class="text-lg">
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
  <div v-show="isOpen" class="flex flex-row gap-4 p-6 bg-neutral-light">
    <div class="flex w-full justify-start gap-4">
      <div>
        <BaseDropdownNew
          class="max-h-9"
          v-model:model-value="selectedMatcher"
          :options="matchers"
          :default-option="filter.selectedMatcher"
          label-position="inline"
          :default-label="t('filters.matcher-labels.select-filter-type')"
          dropdown-style="default"
        />
      </div>
      <div class="flex-grow">
        <component
          v-if="selectedMatcher"
          :is="matcherComponent"
          :filter="filter"
          :related-active-filters="relatedActiveFilters"
          @new-advanced-filter-input="(input: AdvancedFilterInput) => advancedFilterInput = input"
          @filter-options="(options: string[]) => (filterOptions = options)"
        />
      </div>
      <BaseButtonNew
        class="!w-9 h-9"
        label=""
        :icon="DamsIcons.Redo"
        :disabled="!selectedMatcher"
        button-style="accentNormal"
        button-size="small"
        @click="
          () => {
            emit('deactivateFilter', advancedFilterInput.key);
            reloadMatcherComponent();
          }
        "
      />
    </div>
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

const props = defineProps<{
  filter: FilterListItem;
  matchers: DropdownOption[];
  clearAllActiveFilters: boolean;
  relatedActiveFilters: string[];
}>();

const emit = defineEmits<{
  (
    event: "activateFilter",
    advancedFilterInput: AdvancedFilterInput,
    selectedMatcher: DropdownOption | undefined
  ): void;
  (
    event: "deactivateFilter",
    advancedFilterKey: string | InputMaybe<string> | undefined
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

  const module = await import(`@/components/filters/matchers/${matcher}.vue`);
  matcherComponent.value = markRaw(module.default);
};

const icon = computed<string>(() =>
  isOpen.value ? Unicons.Minus.name : Unicons.Plus.name
);

const defaultMatcherMap: Partial<Record<AdvancedFilterTypes, string>> = {
  [AdvancedFilterTypes.Selection]: "ExactMatcher",
  [AdvancedFilterTypes.Text]: "ContainsMatcher",
};

const reloadMatcherComponent = () => {
  matcherComponent.value = undefined;
  loadMatcher();
};

onMounted(() => {
  const defaultMatcher =
    props.filter.selectedMatcher ||
    matchers.value.find(
      (matcher) =>
        matcher.value === defaultMatcherMap[advancedFilterInput.value.type]
    );

  if (defaultMatcher && !selectedMatcher.value)
    selectedMatcher.value = defaultMatcher;
});

watch(selectedMatcher, async () => {
  emit("deactivateFilter", advancedFilterInput.value.key);
  if (selectedMatcher.value) await loadMatcher();

  filterOptions.value.forEach((option) =>
    dequeueItemForBulkProcessing(
      BulkOperationsContextEnum.FilterOptions,
      option
    )
  );
});
watch(advancedFilterInput, () => {
  if (Array.isArray(advancedFilterInput.value.value))
    if (advancedFilterInput.value.value.length > 0)
      emit("activateFilter", advancedFilterInput.value, selectedMatcher.value);
    else emit("deactivateFilter", advancedFilterInput.value.key);
  else if (advancedFilterInput.value.value !== undefined)
    emit("activateFilter", advancedFilterInput.value, selectedMatcher.value);
  else emit("deactivateFilter", advancedFilterInput.value.key);
});
watch(clearAllActiveFilters, () => {
  if (clearAllActiveFilters.value) {
    isOpen.value = false;
    reloadMatcherComponent();
  }
});
</script>
