<template>
  <div v-if="!isEdit || !field" class="text-sm pl-4">
    <p class="text-text-light w-full">{{ t(label || "") }}</p>
    <div v-if="Array.isArray(readableValue)">
      <div v-for="item in readableValue" :key="item">
        <p v-if="!stringIsUrl(item)">{{ item }}</p>
        <a v-else class="underline" target="_blank" :href="item">{{ item }}</a>
      </div>
      <div v-if="readableValue.length == 0">-</div>
    </div>
    <div v-else>
      <a
        v-if="stringIsUrl(readableValue)"
        class="underline"
        target="_blank"
        :href="readableValue"
        >{{ readableValue }}</a
      >
      <p v-else-if="stringIsHtml(readableValue)" v-html="readableValue"></p>
      <p v-else>{{ (readableValue as string) || "-" }}</p>
    </div>
  </div>
  <div v-else class="text-sm pl-4">
    <BaseInputTextNumberDatetime
      :name="fieldKey"
      v-if="!isDropdownType"
      v-model="computedValue"
      :label="label"
      :type="field.type as any"
      input-style="defaultWithBorder"
    />
    <ViewModesAutocomplete
      v-if="
        isDropdownType && field.type === InputFieldTypes.DropdownMultiselect
      "
      v-model="computedValue"
      :metadata-key-to-get-options-for="fieldKey"
      :label="label"
      :select-type="field.type === 'dropdownMultiselect' ? 'multi' : 'single'"
      :options="field.options"
    />
    <BaseDropdownNew
      v-if="
        isDropdownType &&
        field.type === InputFieldTypes.Dropdown &&
        field.options
      "
      :modelValue="computedValue"
      :options="(field.options as DropdownOption[])"
      dropdown-style="defaultWithBorder"
      :label="label"
      @update:model-value="setComputedValue"
    />
    <p class="text-red-default">{{ errorMessage }}</p>
  </div>
</template>

<script lang="ts" setup>
import type { DropdownOption, Unit } from "@/generated-types/queries";
import type { FormContext } from "vee-validate";
import {
  InputFieldTypes,
  type InputField as InputFieldType,
} from "@/generated-types/queries";
import BaseDropdownNew from "./base/BaseDropdownNew.vue";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import ViewModesAutocomplete from "@/components/library/view-modes/ViewModesAutocomplete.vue";
import { computed, onMounted } from "vue";
import { useField } from "vee-validate";
import { useFormHelper } from "@/composables/useFormHelper";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  fieldKey: string;
  label: string;
  value: string;
  field: InputFieldType;
  formId: string;
  isEdit: boolean;
  unit?: string;
}>();
const { getForm } = useFormHelper();
let form: FormContext | undefined = undefined;
const { t } = useI18n();
const {
  errorMessage,
  value: fieldValue,
  setValue,
} = useField<string>(
  "intialValues." + props.fieldKey,
  props.field && props.field.validation ? props.field.validation : undefined,
  {
    label: t(props.label),
  }
);

onMounted(() => {
  form = getForm(props.formId);
  setValue(props.value);
});

const computedValue = computed<any>({
  get() {
    return fieldValue.value;
  },
  set(value) {
    setValue(value);
    if (props.field.type == "dropdown") {
      if (Array.isArray(value)) value = value[0];
    }
    if (form) {
      form.setFieldValue(`intialValues.${props.fieldKey}`, value);
    }
  },
});

const setComputedValue = (newDropdownOption: DropdownOption) => {
  if (computedValue.value === newDropdownOption.value) return;
  computedValue.value = newDropdownOption.value;
};

const isDropdownType = computed(() => {
  const dropdownTypes = [
    InputFieldTypes.Dropdown as string,
    InputFieldTypes.DropdownMultiselect as string,
  ];
  let isDropdown = false;
  if (props.field) {
    isDropdown = dropdownTypes.includes(props.field.type);
  }
  return isDropdown;
});

//From view component
import {
  convertUnitToReadbleFormat,
  stringIsUrl,
  stringIsHtml,
} from "@/helpers";

const readableValue = computed(() => {
  return convertUnitToReadbleFormat(props.unit as Unit, fieldValue.value ?? "");
});
</script>
