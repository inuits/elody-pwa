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
import { DamsIcons, DropdownOption } from "@/generated-types/queries";
import { ref, computed } from "vue";
import BaseInputAutocomplete from "@/components/base/BaseInputAutocomplete.vue";

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
    console.log('original value: ', value)
    let valueToEmit = Array.isArray(value) ? value : [value];
    valueToEmit = valueToEmit.length === 0 ? "" : valueToEmit;
    console.log(valueToEmit)
    emit("update:modelValue", valueToEmit);
  },
});

const mapModelValueToDropdownOptions = (values: any[]): DropdownOption[] => {
  if (!values) return [];

  if (Array.isArray(values)) {
    return values.map((item) => {
      if (item.__typename === "DropdownOption") return item;
      return {
        icon: DamsIcons.NoIcon,
        label: item,
        value: item,
        __typename: "DropdownOption",
      };
    });
  }

  return [
    {
      icon: DamsIcons.NoIcon,
      label: values,
      value: values,
      __typename: "DropdownOption",
    },
  ];
};

const filterAutocompleteOptions = (value: string): void => {
  dropdownOptions.value = props.metadataDropdownOptions.filter(
    (option: DropdownOption) => option.value.includes(value),
  );
};
</script>
