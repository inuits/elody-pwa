<template>
  <div v-if="loading" class="flex items-center justify-center">
    <SpinnerLoader />
  </div>
  <div v-else>
    <BaseInputCheckbox
      v-for="option in filterOptions"
      :key="option.option.value"
      v-model="option.isSelected"
      :class="{ 'mb-2': option.isSelected }"
      :label="option.option.label"
      :item="{ id: option.option.value }"
      input-style="accentNormal"
      :ignore-bulk-operations="true"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, watch, ref } from "vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";
import type { DropdownOption } from "@/generated-types/queries";
import { type FilterListItem } from "@/composables/useStateManagement";

const props = defineProps<{
  options: DropdownOption[];
  filter: FilterListItem;
}>();

const emit = defineEmits(["updateValue", "filterOptions"]);

const filterOptions = ref<{ isSelected: boolean; option: DropdownOption }[]>(
  [],
);

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

watch(filterOptions.value, (newValue) => {
  const selectedValues = newValue
    .filter((option) => option.isSelected)
    .map((option) => option.option.value);
  const value = selectedValues.length > 0 ? selectedValues : undefined;

  emit("updateValue", value);
});
</script>
