<template>
  <div>
    <ViewModesAutocomplete
      v-if="field.type === InputFieldTypes.DropdownMultiselect"
      v-model="metadataValue"
      :metadata-key-to-get-options-for="fieldKey"
      :select-type="field.type === 'dropdownMultiselect' ? 'multi' : 'single'"
      :options="field.options"
    />
    <BaseDropdownNew
      v-else-if="field.type === InputFieldTypes.Dropdown && field.options"
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
import type { DropdownOption } from "@/generated-types/queries";
import type { FormContext } from "vee-validate";
import {
  InputFieldTypes,
  type InputField as InputFieldType,
} from "@/generated-types/queries";
import BaseDropdownNew from "../base/BaseDropdownNew.vue";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import ViewModesAutocomplete from "@/components/library/view-modes/ViewModesAutocomplete.vue";
import { onMounted, watch, ref } from "vue";
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
  isMetadataOnRelation?: boolean;
  setValue: Function;
}>();
const { getForm, addEditableMetadataOnRelationKey } = useFormHelper();
let form: FormContext | undefined = undefined;
const { t } = useI18n();
const metadataValue = ref<string | DropdownOption>(props.value);

onMounted(() => {
  form = getForm(props.formId);
  props.setValue(props.value);
  if (props.isMetadataOnRelation)
    addEditableMetadataOnRelationKey(props.fieldKey, props.formId);
});

const getValueFromMetadata = () => {
  if (typeof metadataValue.value === "string") return metadataValue.value;
  return metadataValue.value.value;
};

watch(
  () => metadataValue.value,
  () => {
    const newValue = getValueFromMetadata();
    if (props.isMetadataOnRelation === false)
      form?.setFieldValue(`intialValues.${props.fieldKey}`, newValue);
    else
      form?.setFieldValue(
        `relationValues.newrelations.${props.fieldKey}`,
        newValue
      );
  }
);
</script>
