<template>
  <div class="text-table">
    <!-- Catalogue CheckboxListFilter: box + label, the count in a muted
         column on the right, hover wash. -->
    <div
      v-for="option in filterOptions"
      :key="option.option.value"
      data-cy="checkbox-filter-option"
      class="flex items-center gap-2 rounded-input hover:bg-accent-wash"
    >
      <BaseInputCheckbox
        v-model="option.isSelected"
        class="flex-1 min-w-0"
        :label="splitCount(option.option.label).name"
        :aria-label="
          splitCount(option.option.label).count
            ? `${splitCount(option.option.label).name}, ${splitCount(option.option.label).count}`
            : undefined
        "
        :item="{ id: option.option.value }"
        :ignore-bulk-operations="true"
        size="compact"
      />
      <span
        v-if="splitCount(option.option.label).count"
        data-cy="checkbox-filter-count"
        class="shrink-0 pr-1 text-text-subtle"
        >{{ splitCount(option.option.label).count }}</span
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, watch, ref } from "vue";
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";
import type { DropdownOption } from "@/generated-types/queries";
import { type FilterListItem } from "@/composables/useStateManagement";

const props = defineProps<{
  options: DropdownOption[];
  filter: FilterListItem;
}>();

const emit = defineEmits(["updateValue", "filterOptions"]);

interface FilterOption {
  isSelected: boolean;
  option: DropdownOption;
}

const filterOptions = ref<FilterOption[]>([]);

// shortcut: the backend sends "Label (12)" as one string; DS 6 (filter
// option counts) should send the count separately, then drop this split.
const splitCount = (label: string): { name: string; count?: string } => {
  const match = /^(.*\S)\s+\((\d+)\)$/.exec(label ?? "");
  return match ? { name: match[1], count: match[2] } : { name: label };
};

onMounted(async () => {
  normalizeOptions(props.options);
  emit(
    "filterOptions",
    filterOptions.value.map((filterOption) => filterOption.option.value),
  );
});

const normalizeOptions = (options: DropdownOption[]) => {
  options.forEach((option) => {
    const isSelected =
      props.filter.inputFromState &&
      props.filter.inputFromState?.value?.includes(option.value);
    filterOptions.value.push({ isSelected: isSelected, option });
  });
};

watch(
  filterOptions,
  (newValue = []) => {
    const selectedValues = newValue
      .filter((option) => option.isSelected)
      .map((option) => option.option.value);
    const value = selectedValues.length > 0 ? selectedValues : undefined;

    emit("updateValue", value);
  },
  { deep: true },
);

const reset = () => {
  filterOptions.value = [];
  normalizeOptions(props.options);
};

defineExpose({
  reset,
});
</script>
