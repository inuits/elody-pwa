<template>
  <div
    v-show="!filter.advancedFilter.hidden"
    class="flex items-center justify-between px-6 py-4 border-t-2 border-neutral-light cursor-pointer select-none"
    :class="{ 'bg-accent-normal text-neutral-white': filter.isActive }"
    @click="isOpen = !isOpen"
  >
    <span class="text-lg">
      {{ filter.advancedFilter.label }}
    </span>
    <unicon :name="icon" height="20" />
  </div>
  <div v-show="isOpen" class="flex flex-col gap-4 p-6 bg-neutral-light">
    <div class="flex gap-4">
      <BaseDropdownNew
        v-model="selectedMatcher"
        :options="matchers"
        label="filter "
        default-label="selecteer filter type"
        dropdown-style="default"
      />
      <BaseButtonNew
        class="!w-10"
        label=""
        :icon="DamsIcons.Redo"
        :disabled="!selectedMatcher"
        button-style="accentAccent"
        button-size="small"
        @click="() => (selectedMatcher = undefined)"
      />
    </div>
    <component
      v-if="selectedMatcher"
      :is="matcherComponent"
      :filter="filter.advancedFilter"
      @new-advanced-filter-input="(input: AdvancedFilterInput) => advancedFilterInput = input"
    />
  </div>
</template>

<script lang="ts" setup>
import type {
  AdvancedFilterInput,
  DropdownOption,
} from "@/generated-types/queries";
import type { FilterListItem } from "@/components/filters-new/FiltersBase.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import BaseDropdownNew from "@/components/base/BaseDropdownNew.vue";
import { computed, markRaw, ref, toRefs, watch } from "vue";
import { DamsIcons } from "@/generated-types/queries";
import { Unicons } from "@/types";
import { useBulkOperations } from "@/composables/useBulkOperations";

const props = defineProps<{
  filter: FilterListItem;
  matchers: DropdownOption[];
  clearAllActiveFilters: boolean;
}>();

const emit = defineEmits<{
  (event: "activateFilter", advancedFilterInput: AdvancedFilterInput): void;
  (event: "deactivateFilter", advancedFilterKey: string): void;
}>();

const { dequeueAllItemsForBulkProcessing } = useBulkOperations();
const { clearAllActiveFilters } = toRefs(props);
const isOpen = ref<boolean>(false);
const matcherComponent = ref();
const selectedMatcher = ref<DropdownOption>();
const advancedFilterInput = ref<AdvancedFilterInput>({
  type: props.filter.advancedFilter.type,
  key: props.filter.advancedFilter.key,
  value: undefined,
});

const loadMatcher = async () => {
  const module = await import(
    `@/components/filters-new/matchers/${selectedMatcher.value?.value}.vue`
  );

  if (matcherComponent.value !== module.default)
    emit("deactivateFilter", advancedFilterInput.value.key);
  matcherComponent.value = markRaw(module.default);
};

const icon = computed<string>(() =>
  isOpen.value ? Unicons.Minus.name : Unicons.Plus.name
);

watch(selectedMatcher, async () => {
  if (selectedMatcher.value) await loadMatcher();
  else emit("deactivateFilter", advancedFilterInput.value.key);
});
watch(advancedFilterInput, () => {
  if (Array.isArray(advancedFilterInput.value.value))
    if (advancedFilterInput.value.value.length > 0)
      emit("activateFilter", advancedFilterInput.value);
    else {
      dequeueAllItemsForBulkProcessing("FilterOptions");
      emit("deactivateFilter", advancedFilterInput.value.key);
    }
  else if (advancedFilterInput.value.value !== undefined)
    emit("activateFilter", advancedFilterInput.value);
  else emit("deactivateFilter", advancedFilterInput.value.key);
});
watch(clearAllActiveFilters, () => {
  if (clearAllActiveFilters.value) {
    isOpen.value = false;
    selectedMatcher.value = undefined;
    dequeueAllItemsForBulkProcessing("FilterOptions");
  }
});
</script>
