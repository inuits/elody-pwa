<template>
  <div>
    <ViewModesAutocomplete
      v-if="
        field.type === InputFieldTypes.DropdownMultiselect ||
        field.type === InputFieldTypes.DropdownSingleselect
      "
      :key="fieldKey"
      v-model="metadataValue"
      :metadata-key-to-get-options-for="fieldKey"
      :select-type="
        field.type === InputFieldTypes.DropdownSingleselect ? 'single' : 'multi'
      "
      :relation-type="field.relationType"
      :from-relation-type="field.fromRelationType"
      :advanced-filter-input-for-searching-options="field.advancedFilterInputForSearchingOptions"
      :mode="formFlow"
      :options="field.options"
      @update:relations="updateRelations"
    />
    <BaseDropdownNew
      v-else-if="field.type === InputFieldTypes.Dropdown"
      v-model:model-value="metadataValue as DropdownOption"
      :options="(field.options as DropdownOption[])"
      dropdown-style="defaultWithBorder"
      :disable="fieldEditIsDisabled"
    />
    <BaseInputTextNumberDatetime
      v-else
      :name="fieldKey"
      v-model:model-value="metadataValue"
      :type="field.type as any"
      input-style="defaultWithBorder"
      @keyup.enter="keyUpEnterEvent()"
      @focusout="keyUpEnterEvent()"
      :disabled="fieldEditIsDisabled"
    />
    <p v-if="fieldIsDirty" class="text-red-default">
      {{ error }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import type { Conditional, DropdownOption } from "@/generated-types/queries";
import {
  InputFieldTypes,
  type InputField as InputFieldType,
} from "@/generated-types/queries";
import type { InBulkProcessableItem } from "@/composables/useBulkOperations";
import BaseDropdownNew from "../base/BaseDropdownNew.vue";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import ViewModesAutocomplete from "@/components/library/view-modes/ViewModesAutocomplete.vue";
import { onMounted, watch, ref, computed, onUpdated } from "vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { useI18n } from "vue-i18n";
import { useConditionalValidation } from "@/composables/useConditionalValidation";

const emit = defineEmits(["update:value", "registerEnterPressed:value", "update:relations"]);

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
  fieldIsDirty: boolean;
  formFlow?: string;
}>();
const { addEditableMetadataOnRelationKey } = useFormHelper();
const { t } = useI18n();
const metadataValue = ref<string | DropdownOption>(props.value);
const { conditionalFieldIsAvailable } = useConditionalValidation();
const fieldEditIsDisabled = computed(() => {
  if (
    props.field.type === InputFieldTypes.Dropdown &&
    !props.field.options?.length
  )
    return true;

  if (!props.field.validation || !props.field.validation.available_if)
    return false;

  return !conditionalFieldIsAvailable(
    props.field?.validation?.available_if as Conditional,
    props.formId
  );
});

onMounted(() => {
  if (props.isMetadataOnRelation)
    addEditableMetadataOnRelationKey(props.fieldKey, props.formId);
});
onUpdated(() => {
  metadataValue.value = props.value;
});

const updateRelations = (relations: { selectedItems: InBulkProcessableItem[], relationType: string  }) => {
  emit("update:relations", relations);
};

const getValueFromMetadata = (): string => {
  if (typeof metadataValue.value !== "object") return metadataValue.value;
  return metadataValue.value.value;
};

const keyUpEnterEvent = () => {
  const newValue = getValueFromMetadata();
  emit("registerEnterPressed:value", newValue);
};

watch(
  () => metadataValue.value,
  () => {
    const newValue = getValueFromMetadata();
    emit("update:value", newValue);
  }
);
</script>
