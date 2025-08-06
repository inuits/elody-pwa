<template>
  <div class="grow">
    <div class="flex gap-2">
      <BaseInputCheckbox
        v-for="(option, idx) in options"
        :key="option.value + '_' + idx"
        v-model="option.isSelected"
        :disabled="isDisabled(option)"
        :label="String(option.value)"
        ignoreBulkOperations
        input-style="accentNormal"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";
import { type FilterListItem } from "@/composables/useStateManagement";
import { onMounted, ref, watch } from "vue";

const props = defineProps<{
  filter: FilterListItem;
}>();

type OptionItem = { isSelected: boolean; value: boolean };

const emit = defineEmits(["updateValue"]);

const options = ref<OptionItem[]>([
  { isSelected: false, value: true },
  { isSelected: false, value: false },
]);

onMounted(() => {
  if (props.filter.inputFromState) {
    options.value.forEach((option) => {
      option.isSelected = option.value === props.filter.inputFromState?.value;
    });
  }
});

const isDisabled = (option: OptionItem) => {
  const selectedCount = options.value.filter((opt) => opt.isSelected).length;
  return selectedCount === 1 && !option.isSelected;
};

watch(options.value, (newValue) => {
  const selectedOption = newValue.find((option) => option.isSelected);
  emit("updateValue", selectedOption?.value);
});

const reset = () => {
  options.value = [
    { isSelected: false, value: true },
    { isSelected: false, value: false },
  ];
};

defineExpose({
  reset,
});
</script>
