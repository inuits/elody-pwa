<template>
  <div :key="label">
    <div
      v-if="!metadata.showOnlyInEditMode"
      class="text-text-light text-sm flex"
    >
      <p>
        {{ metadata.label ? t(metadata.label) : t("metadata.no-label") }}
      </p>
      <p v-if="isFieldRequired && isEdit" class="pl-1">*</p>
    </div>
    <entity-element-metadata-edit
      v-if="isEdit && metadata.inputField"
      :fieldKey="isMetadataOnRelation ? `${fieldKeyWithId}` : metadata.key"
      :label="metadata.label as string"
      v-model:value="value"
      :field="metadata.inputField"
      :formId="formId"
      :formFlow="formFlow"
      :unit="metadata.unit"
      :link-text="metadata.linkText"
      :isMetadataOnRelation="isMetadataOnRelation"
      :error="errorMessage"
      :fieldIsDirty="fieldIsDirty"
      @update:value="setNewValue"
      @register-enter-pressed:value="registerEnterKeyPressed"
    />
    <base-tooltip
      v-else
      class="w-full"
      position="right-end"
      :tooltip-offset="8"
    >
      <template #activator="{ on }">
        <div v-on="on">
          <ViewModesAutocomplete
            v-if="
              (metadata.inputField?.type ===
                InputFieldTypes.DropdownMultiselect ||
                metadata.inputField?.type ===
                  InputFieldTypes.DropdownSingleselect) &&
              metadata.value
            "
            :metadata-key-to-get-options-for="metadata.key"
            :from-relation-type="metadata.inputField?.fromRelationType"
            :is-edit-mode="false"
          />
          <entity-element-metadata
            v-else
            class="line-clamp-1"
            :label="metadata.label as string"
            v-model:value="value"
            :link-text="metadata.linkText"
            :link-icon="metadata.linkIcon"
            :unit="metadata.unit"
            :base-library-mode="baseLibraryMode"
            :basic-base-library-as-value="basicBaseLibraryAsValue"
          />
        </div>
      </template>
      <template #default>
        <entity-element-metadata
          class="text-text-placeholder"
          :label="metadata.label as string"
          v-model:value="value"
          :link-text="metadata.linkText"
          :link-icon="metadata.linkIcon"
          :unit="metadata.unit"
          :base-library-mode="baseLibraryMode"
        />
      </template>
    </base-tooltip>
  </div>
</template>

<script lang="ts" setup>
import EntityElementMetadataEdit from "@/components/metadata/EntityElementMetadataEdit.vue";
import EntityElementMetadata from "@/components/metadata/EntityElementMetadata.vue";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import {
  BaseLibraryModes,
  MetadataField,
  PanelMetaData,
  InputFieldTypes,
} from "@/generated-types/queries";
import type { InBulkProcessableItem } from "@/composables/useBulkOperations";
import { computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useOrderListItems, OrderItem } from "@/composables/useOrderListItems";
import { useField } from "vee-validate";
import { useConditionalValidation } from "@/composables/useConditionalValidation";
import { useFormHelper } from "@/composables/useFormHelper";
import { defineRule } from "vee-validate";
import ViewModesAutocomplete from "@/components/library/view-modes/ViewModesAutocomplete.vue";

defineRule("at_least_one_value_with_key", (value: any, type: any) => {
  if (!Array.isArray(value)) {
    return false;
  }

  const relationType = type[0];
  return value.some((item: any) => item?.type === relationType);
});

const { t } = useI18n();
const { addOrderItem, removeOrderItem, updateOrderItem } = useOrderListItems();
const { getForm } = useFormHelper();

const props = withDefaults(
  defineProps<{
    isEdit: boolean;
    formId: string;
    metadata: PanelMetaData;
    linkedEntityId?: String;
    baseLibraryMode?: BaseLibraryModes;
    formFlow: "edit" | "create";
  }>(),
  {
    baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
    formFlow: "edit",
  }
);

const emit = defineEmits(["update:relations"]);

const setNewValue = (newValue: string) => {
  value.value = newValue;
  const form = getForm(props.formId);
  if (form) {
    form.setFieldValue(veeValidateField.value, newValue);
  }
};
const registerEnterKeyPressed = async (value: string) => {
  await updateOrderItem(props.formId, fieldKeyWithId.value, value);
};
defineExpose({
  setNewValue,
});

const isMetadataOnRelation = computed(
  () => props.metadata.__typename === "PanelRelationMetaData"
);
const fieldKeyWithId = computed(
  () => `${props.metadata.key}-${props.linkedEntityId}`
);
const fieldIsDirty = computed(() => meta.dirty);
const { conditionalFieldIsRequired } = useConditionalValidation();
const isFieldRequired = computed(() => {
  if (props.metadata?.inputField?.validation?.value?.includes("required"))
    return true;
  if (props.metadata?.inputField?.validation?.required_if)
    return conditionalFieldIsRequired(
      props.metadata?.inputField?.validation?.required_if,
      props.formId
    );
  return false;
});
const getValidationRules = (metadata: PanelMetaData): string => {
  const rules: string = metadata?.inputField?.validation?.value as string;
  if (
    metadata.inputField?.type === InputFieldTypes.DropdownMultiselect ||
    metadata.inputField?.type === InputFieldTypes.DropdownSingleselect
  )
    return `at_least_one_value_with_key:${metadata.inputField.relationType}`;
  if (isFieldRequired.value)
    return rules.includes("required") ? rules : `${rules}|required`;
  return rules;
};
const rules = computed(() => getValidationRules(props.metadata));
const label = computed(() =>
  props.metadata.label
    ? t(props.metadata.label as string)
    : t("metadata.no-label")
);

const veeValidateField = computed(() => {
  if (isMetadataOnRelation.value)
    return `relationValues.relationMetadata.${fieldKeyWithId.value}`;
  else if (
    props.metadata.inputField?.type === InputFieldTypes.DropdownMultiselect ||
    props.metadata.inputField?.type === InputFieldTypes.DropdownSingleselect
  )
    return "relationValues.relations";
  else if (props.metadata.inputField)
    return `intialValues.${props.metadata.key}`;
  else if (props.linkedEntityId === undefined)
    return `intialValues.${props.metadata.key}`;
  else return `intialValues.${fieldKeyWithId.value}`;
});

const { errorMessage, value, meta } = useField<string>(
  veeValidateField,
  rules,
  { label: label }
);

onMounted(() => {
  if (!value.value) setNewValue(props.metadata.value);
  if (isMetadataOnRelation.value && props.metadata.key === "order") {
    const orderItem: OrderItem = {
      field: fieldKeyWithId.value,
      initialValue: parseInt(props.metadata.value),
      currentValue: parseInt(props.metadata.value),
    };
    addOrderItem(props.formId, orderItem);
  }
});
onBeforeUnmount(() => {
  if (props.metadata.key !== "order") return;
  removeOrderItem(props.formId, fieldKeyWithId.value);
});

watch(
  () => props.isEdit,
  () => {
    if (!props.isEdit) setNewValue(props.metadata.value);
  }
);
</script>
