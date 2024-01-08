<template>
  <div>
    <ViewModesAutocomplete
      v-if="
        field.type === InputFieldTypes.DropdownMultiselect ||
        field.type === InputFieldTypes.DropdownSingleselect
      "
      v-model="metadataValue"
      :metadata-key-to-get-options-for="fieldKey"
      :select-type="
        field.type === InputFieldTypes.DropdownSingleselect ? 'single' : 'multi'
      "
      :relationType="field.relationType"
      :options="field.options"
    />
    <BaseDropdownNew
      v-else-if="field.type === InputFieldTypes.Dropdown"
      v-model:model-value="metadataValue as DropdownOption"
      :options="(field.options as DropdownOption[])"
      dropdown-style="defaultWithBorder"
      :disable="!field.options.length"
    />
    <BaseInputTextNumberDatetime
      v-else
      :name="fieldKey"
      v-model:model-value="metadataValue"
      :type="field.type as any"
      input-style="defaultWithBorder"
    />
    <p v-if="metadataValue?.length > 1" class="text-red-default">
      {{ error }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import type { DropdownOption } from "@/generated-types/queries";
import {
  InputFieldTypes,
  type InputField as InputFieldType,
} from "@/generated-types/queries";
import BaseDropdownNew from "../base/BaseDropdownNew.vue";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import ViewModesAutocomplete from "@/components/library/view-modes/ViewModesAutocomplete.vue";
import { onMounted, watch, ref, onUpdated } from "vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { useI18n } from "vue-i18n";

const emit = defineEmits(["update:value"]);

const props = defineProps<{
  fieldKey: string;
  label: string;
  value: string;
  field: InputFieldType;
  formId: string;
  unit?: string;
  linkText?: string;
  isMetadataOnRelation?: boolean;
  error?: string;
}>();
const { addEditableMetadataOnRelationKey } = useFormHelper();
const { t } = useI18n();
const metadataValue = ref<string | DropdownOption>(props.value);

onMounted(() => {
  if (props.isMetadataOnRelation)
    addEditableMetadataOnRelationKey(props.fieldKey, props.formId);
});
onUpdated(() => {
  metadataValue.value = props.value;
});

const getValueFromMetadata = (): string => {
  if (typeof metadataValue.value !== "object") return metadataValue.value;
  return metadataValue.value.value;
};

watch(
  () => metadataValue.value,
  () => {
    const newValue = getValueFromMetadata();
    emit("update:value", newValue);
  }
);
</script>
