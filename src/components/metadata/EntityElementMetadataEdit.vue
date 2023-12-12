<template>
  <div>
    <ViewModesAutocomplete
      v-if="
       field.type === InputFieldTypes.DropdownMultiselect
      "
      v-model="metadataValue"
      :metadata-key-to-get-options-for="fieldKey"
      :select-type="field.type === 'dropdownMultiselect' ? 'multi' : 'single'"
      :options="field.options"
    />
    <BaseDropdownNew
      v-else-if="
        field.type === InputFieldTypes.Dropdown &&
        field.options
      "
      v-model:model-value="metadataValue as DropdownOption"
      :options="(field.options as DropdownOption[])"
      dropdown-style="defaultWithBorder"
    />
    <BaseInputTextNumberDatetime
        v-else
        :name="fieldKey"
        v-model="metadataValue"
        :type="field.type as any"
        input-style="defaultWithBorder"
    />
    <p v-if="metadataValue?.length > 1" class="text-red-default">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import type {DropdownOption} from "@/generated-types/queries";
import type { FormContext } from "vee-validate";
import {
  InputFieldTypes,
  type InputField as InputFieldType,
} from "@/generated-types/queries";
import BaseDropdownNew from "../base/BaseDropdownNew.vue";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import ViewModesAutocomplete from "@/components/library/view-modes/ViewModesAutocomplete.vue";
import { onMounted, watch, ref } from "vue";
import { useField } from "vee-validate";
import { useFormHelper } from "@/composables/useFormHelper";
import { useI18n } from "vue-i18n";

const props = defineProps<{
  fieldKey: string;
  label: string;
  value: string;
  field: InputFieldType;
  formId: string;
  unit?: string;
  linkText?: string;
}>();
const { getForm } = useFormHelper();
let form: FormContext | undefined = undefined;
const { t } = useI18n();
const metadataValue = ref<string | DropdownOption>(props.value)
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

watch(() => metadataValue.value, () => {
if (typeof metadataValue.value === 'string') setValue(metadataValue.value)
else {
    setValue(metadataValue.value.value)
}
})
</script>
