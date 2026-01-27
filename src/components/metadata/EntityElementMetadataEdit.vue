<template>
  <div>
    <ViewModesAutocompleteRelations
      v-if="
        (field.type === InputFieldTypes.DropdownMultiselectRelations ||
          field.type === InputFieldTypes.DropdownSingleselectRelations) &&
        !hiddenField?.inherited
      "
      v-model="metadataValue"
      :metadata-key-to-get-options-for="metadataKeyToGetOptionsFor"
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
      :canCreateOption="field.canCreateEntityFromOption"
      :select-type="
        field.type === InputFieldTypes.DropdownSingleselectMetadata
          ? 'single'
          : 'multi'
      "
      :disabled="field.disabled"
      mode="edit"
    />
    <AdvancedDropdown
      v-else-if="field.type === InputFieldTypes.Dropdown"
      v-model:model-value="metadataValue"
      :options="field.options as DropdownOption[]"
      :clearable="!isFieldRequired"
      :multiple="field.multiple || false"
      :disable="fieldEditIsDisabled"
      :show-menu-header="false"
      style-type="defaultWithBorder"
    />
    <div v-else :class="[{ 'grid grid-cols-[80%_20%]': enableCopyFromParent }]">
      <BaseInputTextNumberDatetime
        :name="fieldKey"
        v-model:model-value="metadataValue"
        :type="field.type as any"
        input-style="defaultWithBorder"
        :disabled="fieldEditIsDisabled"
      />
      <base-button-new
        v-if="enableCopyFromParent"
        class="ml-1"
        :label="t(copyValueFromParent.label)"
        button-style="accentAccent"
        button-size="small"
        @click="() => copyValueFromParentAction(copyValueFromParent.key)"
      />
    </div>
    <div v-if="showErrors && !fieldIsValid" class="text-red-default">
      <p>
        {{ computedError }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  type AdvancedFilterInput,
  type Conditional,
  type CopyValueFromParentIntialValues,
  type DropdownOption,
  EditStatus,
  Entitytyping,
  type HiddenField,
} from "@/generated-types/queries";
import { auth } from "@/main";
import {
  InputFieldTypes,
  type BaseRelationValuesInput,
  type InputField as InputFieldType,
} from "@/generated-types/queries";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import ViewModesAutocompleteRelations from "@/components/library/view-modes/ViewModesAutocompleteRelations.vue";
import { addCurrentTimeZoneToDateTimeString, isDateTime } from "@/helpers";
import { onMounted, watch, computed, inject } from "vue";
import { useConditionalValidation } from "@/composables/useConditionalValidation";
import { useFormHelper } from "@/composables/useFormHelper";
import { useI18n } from "vue-i18n";
import ViewModesAutocompleteMetadata from "@/components/library/view-modes/ViewModesAutocompleteMetadata.vue";
import AdvancedDropdown from "@/components/base/AdvancedDropdown.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";

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
  isFieldRequired: boolean;
  copyValueFromParent: CopyValueFromParentIntialValues;
  extractValueFromParent: (
    key: string,
  ) => string | string[] | number | number[] | undefined;
}>();

const mediafileViewerContext: any = inject("mediafileViewerContext");
const computedError = computed<string>(() => {
  const fastValidationMessage = props.field?.validation
    ?.fastValidationMessage as string;
  if (fastValidationMessage) return t(fastValidationMessage);

  let error = "";
  if (props.error?.value) {
    error = t(props.error?.value as string);
  } else if (props.error && typeof props.error === "string") {
    error = t(props.error as string);
  }
  return error;
});

const { addEditableMetadataKeys, addMappedRelations } = useFormHelper();
const metadataValue = computed<string | string[] | number | number[]>({
  get() {
    if (typeof props.value === "object" && props.value?.formatter) {
      if (props.value?.formatter.startsWith("pill")) {
        return props.value.label;
      } else {
        return props.value;
      }
    } else {
      return props.value;
    }
  },
  set(newValue) {
    let valueFromMetadata = getValueFromMetadata(newValue);
    if (
      typeof props.value === "object" &&
      props.value?.formatter?.startsWith("pill")
    ) {
      valueFromMetadata = {
        ...props.value,
        label: valueFromMetadata as string,
      };
    }
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

const enableCopyFromParent = computed(() => {
  if (!props.copyValueFromParent || !props.extractValueFromParent) return false;
  const value = props.extractValueFromParent(props.copyValueFromParent?.key);
  return !(!value || value == "");
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
      if (isDateTime(metadataItem)) {
        returnArray.push(addCurrentTimeZoneToDateTimeString(metadataItem));
      } else returnArray.push(metadataItem);
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

const metadataKeyToGetOptionsFor = computed(() => {
  const field = props.field;
  if (field.entityType) return field.entityType;

  return field.advancedFilterInputForSearchingOptions?.item_types
    ? field.advancedFilterInputForSearchingOptions?.item_types[0]
    : props.fieldKey;
});

const getIdForHiddenFieldFilter = (): any => {
  if (
    props.field.advancedFilterInputForSearchingOptions.item_types[0] ===
      Entitytyping.User &&
    props.hiddenField.searchValueForFilter === "email"
  ) {
    return auth.user.email;
  }
};

const populateInheritedHiddenField = () => {
  const relation: BaseRelationValuesInput = {
    editStatus: EditStatus.New,
    key: "",
    type: props.field.relationType!,
    value: "",
    inheritFrom: {
      entityType: props.hiddenField.entityType!,
      relationKey: props.hiddenField.relationToExtractKey!,
      valueKey: props.hiddenField.keyToExtractValue!,
    },
  };
  addMappedRelations([relation], props.field.relationType!, props.formId);
};

const populateHiddenField = (): BaseRelationValuesInput[] | undefined => {
  const relations: BaseRelationValuesInput[] = [];

  if (props.field.type === InputFieldTypes.DropdownMultiselectRelations) {
    relations.push({
      editStatus: EditStatus.New,
      key: getIdForHiddenFieldFilter(),
      type: props.field.relationType,
      value: getIdForHiddenFieldFilter(),
    });
    return relations;
  }
};

const copyValueFromParentAction = (key: string) => {
  const newValue = props.extractValueFromParent(key);
  if (!newValue) return;
  metadataValue.value = newValue;
};

watch(
  () => isFieldHidden.value,
  () => {
    if (!isFieldHidden.value) return;
    if (props.hiddenField?.inherited) return populateInheritedHiddenField();
    const newValue = populateHiddenField();
    emit("update:value", newValue);
  },
  { immediate: true },
);
</script>
