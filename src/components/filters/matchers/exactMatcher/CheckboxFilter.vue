<template>
  <div>
    <BaseInputCheckbox
      v-for="option in filterOptions"
      :key="option.option.value"
      v-model="option.isSelected"
      :class="{ 'mb-2': option.isSelected }"
      :label="option.option.label"
      :aria-label="optionName(option.option)"
      :item="{ id: option.option.value }"
      :ignore-bulk-operations="true"
    >
      <!-- The count is part of the option, so it also sits in the accessible
           name ("BOEK, 812 resultaten") rather than being decoration only. -->
      <template #label>
        <span class="checkbox-filter__label">{{ option.option.label }}</span>
        <span
          v-if="countFor(option.option) !== undefined"
          class="checkbox-filter__count"
          aria-hidden="true"
        >
          {{ countFor(option.option) }}
        </span>
      </template>
    </BaseInputCheckbox>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, watch, ref } from "vue";
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";
import { useI18n } from "vue-i18n";
import type { DropdownOption } from "@/generated-types/queries";
import { type FilterListItem } from "@/composables/useStateManagement";

const props = defineProps<{
  options: DropdownOption[];
  filter: FilterListItem;
  /** Per-option result counts from the facets query. */
  counts?: Map<string, number>;
}>();

const { t } = useI18n();

const countFor = (option: DropdownOption): number | undefined =>
  props.counts?.get(String(option.value));

const optionName = (option: DropdownOption): string | undefined => {
  const count = countFor(option);
  if (count === undefined) return undefined;
  return t("filters.option-count-name", { label: option.label, count });
};

const emit = defineEmits(["updateValue", "filterOptions"]);

interface FilterOption {
  isSelected: boolean;
  option: DropdownOption;
}

const filterOptions = ref<FilterOption[]>([]);

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

<style scoped>
/* Each option spans the rail so the counts line up on the right. */
:deep(.ds-checkbox) {
  display: flex;
  width: 100%;
}

:deep(.ds-checkbox__label) {
  flex: 1;
  min-width: 0;
}

.checkbox-filter__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Muted numeral on the count-chip surface; hidden from the name because the
   accessible name already carries it in words. */
.checkbox-filter__count {
  flex: none;
  margin-left: auto;
  padding: 0 var(--spacing-ds-3);
  border-radius: var(--radius-chip);
  background-color: var(--color-chip-count-bg);
  color: var(--color-text-secondary);
  font-size: var(--text-hint);
}
</style>
