<template>
  <base-input-autocomplete
    v-if="mode === 'edit' || (modelValue && modelValue.length > 0)"
    v-model="inputValue"
    :autocomplete-style="!disabled ? 'defaultWithBorder' : 'readOnly'"
    :options="dropdownOptions"
    :select-type="selectType"
    :disabled="disabled"
    :can-create-option="canCreateOption"
    @search-change="
      (value: string) => {
        filterAutocompleteOptions(value);
      }
    "
  />
  <p v-else data-cy="metadata-value">
    {{ "-" }}
  </p>
</template>

<script lang="ts" setup>
import { type DropdownOption } from "@/generated-types/queries";
import { ref, computed } from "vue";
import BaseInputAutocomplete from "@/components/base/BaseInputAutocomplete.vue";
import { mapModelValueToDropdownOptions } from "@/helpers";

const emit = defineEmits<{
  (event: "update:modelValue", modelValue: number | number[]): void;
}>();

const props = withDefaults(
  defineProps<{
    modelValue: string[] | string | undefined;
    metadataDropdownOptions: any[];
    formId: string;
    selectType?: "multi" | "single";
    autoSelectable?: boolean;
    disabled?: boolean;
    canCreateOption?: boolean;
    mode: "view" | "edit";
  }>(),
  {
    selectType: "multi",
    autoSelectable: false,
    disabled: false,
    canCreateOption: false,
    mode: "view",
  },
);

const dropdownOptions = ref<DropdownOption[]>(
  props.metadataDropdownOptions || [],
);
const inputValue = computed<DropdownOption[] | undefined>({
  get() {
    return mapModelValueToDropdownOptions(props.modelValue);
  },
  set(value) {
    if (props.selectType === "single")
      return emit("update:modelValue", value[0]?.value || value[0] || "");
    emit("update:modelValue", Array.isArray(value) ? value.map(value => value.value) : [value]);
  },
});

const filterAutocompleteOptions = (value: string): void => {
  dropdownOptions.value = props.metadataDropdownOptions.filter(
    (option: DropdownOption) => option.value.includes(value),
  );
};
</script>
