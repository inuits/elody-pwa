<template>
  <div>
    <ViewModesAutocompleteRelations
      v-if="
        field.type === InputFieldTypes.DropdownMultiselectRelations ||
        field.type === InputFieldTypes.DropdownSingleselectRelations
      "
      v-model="metadataValue"
      :metadata-key-to-get-options-for="
        field.advancedFilterInputForSearchingOptions?.item_types
          ? field.advancedFilterInputForSearchingOptions?.item_types[0]
          : fieldKey
      "
      :select-type="
        field.type === InputFieldTypes.DropdownSingleselectRelations
          ? 'single'
          : 'multi'
      "
      :relation-type="field.relationType"
      :from-relation-type="field.fromRelationType"
      :advanced-filter-input-for-retrieving-options="
        field.advancedFilterInputForRetrievingOptions
      "
      :advanced-filter-input-for-retrieving-related-options="
        field.advancedFilterInputForRetrievingRelatedOptions
      "
      :advanced-filter-input-for-retrieving-all-options="
        field.advancedFilterInputForRetrievingAllOptions
      "
      :advanced-filter-input-for-searching-options="
        field.advancedFilterInputForSearchingOptions
      "
      :is-metadata-field="field.isMetadataField"
      :relation-filter="relationFilter"
      :mode="formFlow"
      :form-id="formId"
      :auto-selectable="field.autoSelectable"
      :disabled="field.disabled"
      :canCreateOption="field.canCreateEntityFromOption"
      :metadataKeyToCreateEntityFromOption="
        field.metadataKeyToCreateEntityFromOption
      "
      :depends-on="field.dependsOn"
    />
    <ViewModesAutocompleteMetadata
      v-else-if="
        field?.type === InputFieldTypes.DropdownMultiselectMetadata ||
        field?.type === InputFieldTypes.DropdownSingleselectMetadata
      "
      v-model:model-value="metadataValue"
      :metadata-dropdown-options="field.options"
      :formId="formId"
      :select-type="
        field.type === InputFieldTypes.DropdownSingleselectMetadata
          ? 'single'
          : 'multi'
      "
      :disabled="field.disabled"
      mode="edit"
    />
    <BaseDropdownNew
      v-else-if="field.type === InputFieldTypes.Dropdown"
      v-model:model-value="metadataValue as DropdownOption | DropdownOption[]"
      :options="field.options as DropdownOption[]"
      dropdown-style="defaultWithBorder"
      :disable="fieldEditIsDisabled"
      :multiple="field.multiple"
    />
    <BaseInputTextNumberDatetime
      v-else
      :name="fieldKey"
      v-model:model-value="metadataValue"
      :type="field.type as any"
      input-style="defaultWithBorder"
      :disabled="fieldEditIsDisabled"
    />
    <div v-if="showErrors && !fieldIsValid" class="text-red-default">
      <p v-if="field.validation.fastValidationMessage">
        {{ t(field.validation.fastValidationMessage) }}
      </p>
      <p v-else>
        {{ t(error) }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  type AdvancedFilterInput,
  type Conditional,
  type DropdownOption,
  EditStatus,
  Entitytyping,
  type HiddenField
} from "@/generated-types/queries";
import { auth } from "@/main";
import {
  InputFieldTypes,
  type BaseRelationValuesInput,
  type InputField as InputFieldType,
} from "@/generated-types/queries";
import BaseDropdownNew from "../base/BaseDropdownNew.vue";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import ViewModesAutocompleteRelations from "@/components/library/view-modes/ViewModesAutocompleteRelations.vue";
import { addCurrentTimeZoneToDateTimeString, isDateTime } from "@/helpers";
import { onMounted, watch, computed, inject } from "vue";
import { useConditionalValidation } from "@/composables/useConditionalValidation";
import { useFormHelper } from "@/composables/useFormHelper";
import { useI18n } from "vue-i18n";
import ViewModesAutocompleteMetadata from "@/components/library/view-modes/ViewModesAutocompleteMetadata.vue";

const emit = defineEmits(["update:value"]);
const { t } = useI18n();

const props = defineProps<{
  fieldKey: string;
  label: string;
  value: string;
  hiddenField?: HiddenField;
  field: InputFieldType;
  formId: string;
  relationFilter?: AdvancedFilterInput;
  unit?: string;
  linkText?: string;
  isMetadataOnRelation?: boolean;
  isRootDataOnRelation?: boolean;
  error?: string;
  showErrors: boolean;
  fieldIsValid: boolean;
  formFlow?: string;
}>();

const mediafileViewerContext: any = inject("mediafileViewerContext");

const { addEditableMetadataKeys } = useFormHelper();
const metadataValue = computed<string | DropdownOption | DropdownOption[]>({
  get() {
    if (typeof props.value === "object" && props.value?.formatter) {
      if (props.value?.formatter.startsWith("link")) {
        return { label: props.value.label, value: props.value.entity.id } as DropdownOption;
      } else if (props.value?.formatter.startsWith("pill")) {
        return props.value.label;
      } else {
        return props.value;
      }
    } else {
      return props.value;
    }
  },
  set(newValue) {
    const valueFromMetadata = getValueFromMetadata(newValue);
    emit("update:value", valueFromMetadata);
  },
});
const { conditionalFieldIsAvailable } = useConditionalValidation();

const isFieldHidden = computed(() => props.hiddenField?.hidden);
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
    props.formId,
    mediafileViewerContext,
  );
});

onMounted(() => {
  if (props.isMetadataOnRelation || props.isRootDataOnRelation)
    addEditableMetadataKeys([props.fieldKey], props.formId);
});

const getValueFromMetadata = (
  newValue: any,
): string | BaseRelationValuesInput[] => {
  if (Array.isArray(newValue)) {
    const returnArray = [];
    newValue.forEach((metadataItem) => {
      if (isDateTime(metadataItem.value)) {
        returnArray.push(
          addCurrentTimeZoneToDateTimeString(metadataItem.value),
        );
      } else returnArray.push(metadataItem.value);
    });
    return returnArray;
  }
  if (typeof newValue !== "object") {
    if (isDateTime(newValue)) {
      return addCurrentTimeZoneToDateTimeString(newValue);
    }
    return newValue;
  }
  return newValue.value;
};

const getIdForHiddenFieldFilter = (): any => {
  if (
    props.field.advancedFilterInputForSearchingOptions.item_types[0] ===
      Entitytyping.User &&
    props.hiddenField.searchValueForFilter === "email"
  ) {
    return auth.user.email;
  }
};

const populateHiddenField = (): BaseRelationValuesInput[] | undefined => {
  if (props.field.type === InputFieldTypes.DropdownMultiselectRelations) {
    const relations: BaseRelationValuesInput[] = [];
    relations.push({
      editStatus: EditStatus.New,
      key: getIdForHiddenFieldFilter(),
      type: props.field.relationType,
      value: getIdForHiddenFieldFilter(),
    });
    return relations;
  }
};

watch(
  () => isFieldHidden.value,
  () => {
    if (!isFieldHidden.value) return;
    const newValue = populateHiddenField();
    emit("update:value", newValue);
  },
  { immediate: true },
);
</script>
