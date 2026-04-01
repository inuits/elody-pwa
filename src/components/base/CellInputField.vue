<template>
  <div class="w-full">
    <BaseInputTextNumberDatetime
      v-if="
        inputField.type === InputFieldTypes.Text ||
        inputField.type === InputFieldTypes.Checkbox
      "
      class="w-full"
      v-model:model-value="value as string"
      input-style="defaultWithBorder"
      :type="inputField.type === InputFieldTypes.Checkbox ? 'checkbox' : 'text'"
      :disabled="disabled"
      @update:model-value="handleUpdate"
    />
    <AdvancedDropdown
      v-else-if="inputField.type === InputFieldTypes.Dropdown"
      class="w-full"
      v-model:model-value="value as string"
      :options="(inputField.options as DropdownOption[]) ?? []"
      :disable="disabled"
      style-type="defaultWithBorder"
      @update:model-value="handleUpdate"
    />
    <ViewModesAutocompleteRelations
      v-if="isFieldRelationDropdown"
      v-model:model-value="value as string"
      select-type="single"
      mode="create"
      :metadata-key-to-get-options-for="metadataKeyToGetOptionsFor"
      :relation-type="inputField.relationType"
      :from-relation-type="inputField.fromRelationType"
      :advanced-filter-input-for-retrieving-options="
        inputField.advancedFilterInputForRetrievingOptions
      "
      :advanced-filter-input-for-retrieving-related-options="
        inputField.advancedFilterInputForRetrievingRelatedOptions
      "
      :advanced-filter-input-for-retrieving-all-options="
        inputField.advancedFilterInputForRetrievingAllOptions
      "
      :advanced-filter-input-for-searching-options="
        inputField.advancedFilterInputForSearchingOptions
      "
      :is-metadata-field="inputField.isMetadataField"
      :relation-filter="inputField.relationFilter"
      :form-id="formId"
      :auto-selectable="inputField.autoSelectable"
      :disabled="inputField.disabled"
      :canCreateOption="inputField.canCreateEntityFromOption"
      :metadataKeyToCreateEntityFromOption="
        inputField.metadataKeyToCreateEntityFromOption
      "
      :depends-on="inputField.dependsOn"
      @update:model-value="handleUpdate"
    />
<!--    TODO: enable-->
<!--    <ViewModesAutocompleteMetadata-->
<!--      v-else-if="-->
<!--        inputField.type === InputFieldTypes.DropdownMultiselectMetadata ||-->
<!--        inputField.type === InputFieldTypes.DropdownSingleselectMetadata-->
<!--      "-->
<!--      v-model:model-value="value as string[]"-->
<!--      :metadata-dropdown-options="inputField.options"-->
<!--      :canCreateOption="true"-->
<!--      :select-type="-->
<!--        inputField.type === InputFieldTypes.DropdownSingleselectMetadata-->
<!--          ? 'single'-->
<!--          : 'multi'-->
<!--      "-->
<!--      :disabled="false"-->
<!--      mode="edit"-->
<!--      @update:model-value="handleUpdate"-->
<!--    />-->
    <p
      v-if="errorMessage"
      data-testid="inputfield-error"
      class="mt-0.5 text-xs text-red-default"
    >
      {{ errorMessage }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { computed, watch, toRef, onBeforeMount } from "vue";
import { useField } from "vee-validate";
import {
  type DropdownOption,
  type InputField,
  type Entitytyping,
  InputFieldTypes,
} from "@/generated-types/queries";
import { useFieldValidation } from "@/components/metadata/useFieldValidation";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import AdvancedDropdown from "@/components/base/AdvancedDropdown.vue";
// import ViewModesAutocompleteMetadata from "@/components/library/view-modes/ViewModesAutocompleteMetadata.vue";
import ViewModesAutocompleteRelations from "@/components/library/view-modes/ViewModesAutocompleteRelations.vue";
import { useGetDropdownOptions } from "@/composables/useGetDropdownOptions";

const props = defineProps<{
  modelValue: any;
  inputField: InputField;
  fieldKey: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: any): void;
}>();

const { getValidationRules } = useFieldValidation(() => props.inputField.validation);
const validationRules = computed(() => getValidationRules(true, false));
const { value, errorMessage } = useField<any>(props.fieldKey, validationRules);

const isFieldRelationDropdown = computed(() => {
  return props.inputField?.type === InputFieldTypes.DropdownMultiselectRelations ||
    props.inputField?.type === InputFieldTypes.DropdownSingleselectRelations
})

const metadataKeyToGetOptionsFor = computed(() => {
  const field = props.inputField;
  if (field.entityType) return field.entityType;

  return field.advancedFilterInputForSearchingOptions?.item_types
    ? field.advancedFilterInputForSearchingOptions?.item_types[0]
    : props.fieldKey;
});


// AUTCOMPLETE DROPDOWNS
// const metadataKeyToGetOptionsForRelationDropdown = computed(() => {
//   const field = props.inputField;
//   if (field.entityType) return field.entityType;
//
//   // const fieldKey =
//   //   isMetadataOnRelation.value
//   //     ? fieldKeyWithId.value
//   //     : refMetadata.value.key;
//
//   return field.advancedFilterInputForSearchingOptions?.item_types
//     ? field.advancedFilterInputForSearchingOptions?.item_types[0]
//     : fieldKey;
// });
const initializeDropdownOptionStates = () => {
  const advancedFilterInputForRetrievingAllOptions = computed(() => {
    if (
      props.inputField.advancedFilterInputForRetrievingAllOptions
        .length > 0
    )
      return props.inputField
        .advancedFilterInputForRetrievingAllOptions;
    return props.inputField.advancedFilterInputForRetrievingOptions;
  });
  useGetDropdownOptions(
    `${props.formId}-${props.inputField?.relationType}-fetchAll`,
      "get",
      props.inputField.entityType,
      toRef("fetchAll"),
      undefined,
      undefined,
      props.inputField.advancedFilterInputForSearchingOptions,
      advancedFilterInputForRetrievingAllOptions.value,
      props.formId,
  );
};
const deleteDropdownOptionStates = () => {
  useGetDropdownOptions(
    `${props.formId}-${props.inputField?.relationType}-fetchAll`,
    "delete",
  );
};
// END AUTCOMPLETE DROPDOWNS


const handleUpdate = (newVal: any) => {
  console.log("Handling update in cell: ", newVal);
  value.value = newVal;
  emit("update:modelValue", newVal);
};

onBeforeMount(() => {
  if (isFieldRelationDropdown.value)
    initializeDropdownOptionStates();
});

watch(
  () => props.modelValue,
  (newVal) => {
    value.value = newVal;
  },
  { immediate: true },
);
</script>
