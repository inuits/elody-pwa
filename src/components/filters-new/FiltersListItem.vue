<template>
  <div
    v-show="!filter.advancedFilter.hidden"
    class="flex items-center justify-between px-6 py-4 border-t-2 cursor-pointer select-none"
    :class="
      filter.isActive
        ? 'bg-accent-normal border-accent-normal'
        : 'border-neutral-light'
    "
    @click="isOpen = !isOpen"
  >
    <span class="text-text-body text-lg">
      {{ filter.advancedFilter.label }}
    </span>
    <unicon :name="icon" height="20" fill="text-text-body" />
  </div>
  <div v-show="isOpen" class="flex flex-col gap-4 p-6 bg-neutral-light">
    <BaseDropdownNew
      v-model="selectedMatcher"
      :options="matchers"
      label="Filter "
      dropdown-style="default"
    />
    <component
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
import BaseDropdownNew from "@/components/base/BaseDropdownNew.vue";
import { computed, markRaw, onMounted, ref, watch } from "vue";
import { Unicons } from "@/types";

const props = defineProps<{
  filter: FilterListItem;
  matchers: DropdownOption[];
}>();

const emit = defineEmits<{
  (event: "activateFilter", advancedFilterInput: AdvancedFilterInput): void;
  (event: "deactivateFilter", advancedFilterKey: string): void;
}>();

const isOpen = ref<boolean>(false);
const matcherComponent = ref();
const selectedMatcher = ref<DropdownOption>();
const advancedFilterInput = ref<AdvancedFilterInput>({
  type: props.filter.advancedFilter.type,
  key: props.filter.advancedFilter.key,
  value: "",
});

const loadMatcher = async () => {
  const module = await import(
    `@/components/filters-new/matchers/${selectedMatcher.value?.value}.vue`
  );
  matcherComponent.value = markRaw(module.default);
};

const icon = computed<string>(() =>
  isOpen.value ? Unicons.Minus.name : Unicons.Plus.name
);

onMounted(() => (selectedMatcher.value = props.matchers[0]));

watch(selectedMatcher, async () => await loadMatcher());
watch(advancedFilterInput, () => {
  if (advancedFilterInput.value.value !== "")
    emit("activateFilter", advancedFilterInput.value);
  else emit("deactivateFilter", advancedFilterInput.value.key);
});
</script>
