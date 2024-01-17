<template>
    <div v-if="!metadata.showOnlyInEditMode"class="text-text-light text-sm flex">
    <p>
      {{ metadata.label ? t(metadata.label) : t("metadata.no-label") }}
    </p>
    <p v-if="isFieldRequired && isEdit" class="pl-1">*</p>
  </div>
  <entity-element-metadata-edit
    v-if="(isEdit && metadata.field) || (isEdit && metadata.inputField)"
    :fieldKey="isMetadataOnRelation ? `${fieldKeyWithId}` : metadata.key"
    :label="metadata.label as string"
    v-model:value="value"
    :field="metadata.field"
    :formId="formId"
    :unit="metadata.unit"
    :link-text="metadata.linkText"
    :isMetadataOnRelation="isMetadataOnRelation"
    :error="errorMessage"
    :fieldIsDirty="fieldIsDirty"
        @update:value="setNewValue"
        @register-enter-pressed:value="registerEnterKeyPressed"
    />
    <entity-element-metadata
        v-else
        :label="metadata.label as string"
        v-model:value="value"
        :link-text="metadata.linkText"
        :link-icon="metadata.linkIcon"
        :unit="metadata.unit"
    />
</template>

<script lang="ts" setup>
import EntityElementMetadataEdit from "@/components/metadata/EntityElementMetadataEdit.vue";
import EntityElementMetadata from "@/components/metadata/EntityElementMetadata.vue";
import { MetadataField } from "@/generated-types/queries";
import { computed, onMounted, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import { useOrderListItems, OrderItem } from "@/composables/useOrderListItems";
import { useField } from "vee-validate";
import { useConditionalValidation } from "@/composables/useConditionalValidation";

const { t } = useI18n();
const { addOrderItem, removeOrderItem, updateOrderItem } = useOrderListItems();

const props = defineProps<{
  isEdit: boolean;
  formId: string;
  metadata: MetadataField;
  linkedEntityId?: String;
}>();

const setNewValue = (newValue: string) => {
  value.value = newValue;
};
const registerEnterKeyPressed = async (value: string) => {
  await updateOrderItem(props.formId, fieldKeyWithId.value, value);
}
defineExpose({
  setNewValue
})

const isMetadataOnRelation = computed(
  () => props.metadata.__typename === "PanelRelationMetaData"
);
const fieldKeyWithId = computed(
  () => `${props.metadata.key}-${props.linkedEntityId}`
);
const fieldIsDirty = computed(() => meta.dirty);
const { conditionalFieldIsRequired } = useConditionalValidation();
const isFieldRequired = computed(() => {
  if (props.metadata?.field?.validation?.value?.includes("required"))
    return true;
  if (props.metadata?.field?.validation?.required_if)
    return conditionalFieldIsRequired(
      props.metadata?.field?.validation?.required_if,
      props.formId
    );
  return false;
});
const getValidationRules = (metadata: MetadataField): string => {
  const rules: string = metadata?.field?.validation?.value as string;
  if (isFieldRequired.value)
    return rules.includes("required") ? rules : `${rules}|required`;
  return rules;
};
const rules = computed(() => getValidationRules(props.metadata));

const veeValidateField = computed(() => {
  if (isMetadataOnRelation.value)
    return `relationValues.relationMetadata.${fieldKeyWithId.value}`;
  else if ( props.metadata.field)
    return `intialValues.${props.metadata.key}`;
  else if (props.linkedEntityId === undefined)
    return `intialValues.${props.metadata.key}`;
  else return `intialValues.${fieldKeyWithId.value}`;
});

const validationRules = computed<string | undefined>(() => {
  if (!props.metadata.field || props.metadata.field.validation)
    return undefined;
  return props.metadata.field.validation;
});

const { errorMessage, value, meta } = useField<string>(
  veeValidateField,
  rules,
  {
    label: props.metadata.label
      ? t(props.metadata.label as string)
      : t("metadata.no-label"),
  }
);

onMounted(() => {
  if (!value.value) setNewValue(props.metadata.value);
  if (isMetadataOnRelation && props.metadata.key === "order") {
    const orderItem: OrderItem = {
      field: fieldKeyWithId.value,
      initialValue: parseInt(props.metadata.value),
      currentValue: parseInt(props.metadata.value)
    };
    addOrderItem(props.formId, orderItem);
  }
});
onBeforeUnmount(() => {
  if (props.metadata.key !== "order") return;
  removeOrderItem(props.formId, fieldKeyWithId.value);
});
</script>