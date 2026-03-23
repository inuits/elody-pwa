<template>
  <base-input-autocomplete
    v-if="mode === 'edit' || (modelValue && modelValue.length > 0)"
    v-model="inputValue"
    :autocomplete-style="!disabled ? 'defaultWithBorder' : 'readOnly'"
    :options="dropdownOptions"
    :select-type="selectType"
    :disabled="disabled"
    :create-option-config="{ canCreateOption }"
    @search-change="
      (value: string) => {
        filterAutocompleteOptions(value);
      }
    "
    @add-option="handleCreatingFromTag"
  />
  <p v-else data-cy="metadata-value">
    {{ "-" }}
  </p>
</template>

<script lang="ts" setup>
import { type DropdownOption } from "@/generated-types/queries";
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import BaseInputAutocomplete from "@/components/base/BaseInputAutocomplete.vue";
import { mapModelValueToDropdownOptions } from "@/helpers";

const { t } = useI18n();

const emit = defineEmits<{
  (event: "update:modelValue", modelValue: number | number[]): void;
}>();

const props = withDefaults(
  defineProps<{
    modelValue: string[] | string | undefined;
    metadataDropdownOptions: any[];
    formId?: string;
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

const filteredOptions = ref<DropdownOption[]>(props.metadataDropdownOptions || []);

const dropdownOptions = computed<DropdownOption[]>(() =>
  filteredOptions.value.map((option) => ({ ...option, label: t(option.label) })),
);

const inputValue = computed<DropdownOption[] | undefined>({
  get() {
    return mapModelValueToDropdownOptions(props.modelValue).map((option) => {
      const match = dropdownOptions.value.find((o) => o.value === option.value);
      return match ? { ...option, label: match.label } : option;
    });
  },
  set(value) {
    if (props.selectType === "single")
      return emit("update:modelValue", value[0]?.value || value[0] || "");
    emit(
      "update:modelValue",
      Array.isArray(value) ? value.map((value) => value.value) : [value],
    );
  },
});

const filterAutocompleteOptions = (value: string): void => {
  filteredOptions.value = props.metadataDropdownOptions.filter(
    (option: DropdownOption) => option.value.includes(value),
  );
};

const handleCreatingFromTag = async (option: any) => {
  if (!props.canCreateOption) return;
  inputValue.value = [...inputValue.value, option];
};
</script>
