<template>
  <div
    data-cy="metadata-wrapper"
    v-if="
      !metadata.showOnlyInEditMode || (metadata.showOnlyInEditMode && isEdit)
    "
    :key="label"
  >
    <div class="text-text-light text-sm flex">
      <p data-cy="metadata-label">
        {{ metadata.label ? t(metadata.label) : t("metadata.no-label") }}
      </p>
      <p
        v-if="props.metadata?.inputField && isEdit && (isOneOfRequiredMetadataField || isOneOfRequiredRelationField)"
        class="pl-1"
      >
        ( {{ t('metadata.labels.one-of-required') }} )
      </p>
      <p
        v-else-if="props.metadata?.inputField && !isFieldRequired && isEdit"
        class="pl-1"
      >
        ( {{ t('metadata.labels.optional') }} )
      </p>
    </div>
    <entity-element-metadata-edit
      v-if="isEdit && metadata.inputField"
      :fieldKey="isMetadataOnRelation ? `${fieldKeyWithId}` : metadata.key"
      :label="metadata.label as string"
      v-model:value="value"
      :field="metadata.inputField"
      :hidden-field="metadata.hiddenField"
      :formId="formId"
      :formFlow="formFlow"
      :unit="metadata.unit"
      :link-text="metadata.linkText"
      :isMetadataOnRelation="isMetadataOnRelation"
      :error="errorMessage"
      :show-errors="
        showErrors ||
        (meta.dirty &&
          !fieldIsValid &&
          metadata.inputField?.validation?.fastValidationMessage)
      "
      :field-is-valid="fieldIsValid"
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
          <MetadataFormatter
            v-if="metadata.value?.formatter"
            v-bind="metadata.value"
          />
          <ViewModesAutocomplete
            v-else-if="
              (metadata.inputField?.type ===
                InputFieldTypes.DropdownMultiselect ||
                metadata.inputField?.type ===
                  InputFieldTypes.DropdownSingleselect) &&
              metadata.value &&
              !metadata.value?.formatter
            "
            v-model="metadata.value"
            :is-read-only="true"
            :field-name="metadata.label"
            :metadata-key-to-get-options-for="
              metadata.inputField.advancedFilterInputForSearchingOptions
                ?.item_types?.[0]
            "
            :advanced-filter-input-for-retrieving-options="
              metadata.inputField.advancedFilterInputForRetrievingOptions
            "
            :is-metadata-field="metadata.inputField?.isMetadataField"
            :from-relation-type="metadata.inputField?.fromRelationType"
            :disabled="true"
          />
          <entity-element-metadata
            v-else
            :class="linkedEntityId ? 'break-all line-clamp-1' : ''"
            :label="metadata.label as string"
            v-model:value="value"
            :link-text="metadata.linkText"
            :link-icon="metadata.linkIcon"
            :unit="metadata.unit"
            :base-library-mode="baseLibraryMode"
          />
        </div>
      </template>
      <template #default>
        <entity-element-metadata
          class="text-text-placeholder"
          :label="metadata.label as string"
          v-model:value="metadadaValueToDisplayOnTooltip"
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
import MetadataFormatter from "@/components/metadata/MetadataFormatter.vue";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import {
  BaseLibraryModes,
  type PanelMetaData,
  InputFieldTypes,
  ValidationRules,
  ValidationFields,
  type BaseRelationValuesInput,
  type PanelRelationMetaData,
} from "@/generated-types/queries";
import { computed, onMounted, onBeforeUnmount, watch, inject } from "vue";
import { useI18n } from "vue-i18n";
import {
  useOrderListItems,
  type OrderItem,
} from "@/composables/useOrderListItems";
import { useField } from "vee-validate";
import { useConditionalValidation } from "@/composables/useConditionalValidation";
import { useFormHelper } from "@/composables/useFormHelper";
import ViewModesAutocomplete from "@/components/library/view-modes/ViewModesAutocomplete.vue";

const { t } = useI18n();
const { addOrderItem, removeOrderItem, updateOrderItem } = useOrderListItems();
const { getForm, getKeyBasedOnInputField } = useFormHelper();

const mediafileViewerContext: any = inject("mediafileViewerContext");

const props = withDefaults(
  defineProps<{
    isEdit: boolean;
    formId: string;
    metadata: PanelMetaData | PanelRelationMetaData;
    linkedEntityId?: String;
    baseLibraryMode?: BaseLibraryModes;
    formFlow?: "edit" | "create";
    showErrors?: boolean;
  }>(),
  {
    baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
    formFlow: "edit",
    showErrors: false,
  }
);

// Todo: Enabling this will break the validation
// Todo: Check if turning this off has other implications
// watch(
//   () => props.metadata,
//   (newvalue, oldvalue) => {
//     if (!Array.isArray(newvalue.value)) setNewValue(newvalue.value);
//   }
// );

const setNewValue = (newValue: string | BaseRelationValuesInput[]) => {
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

const metadadaValueToDisplayOnTooltip = computed(
  () => props.metadata?.value?.label || value.value
);

const isMetadataOnRelation = computed(
  () => props.metadata.__typename === "PanelRelationMetaData"
);
const fieldKeyWithId = computed(
  () =>
    `${props.metadata.key}${
      props.linkedEntityId ? "-" + props.linkedEntityId : ""
    }`
);
const fieldIsValid = computed(() => meta.valid);

const { conditionalFieldIsRequired } = useConditionalValidation();

const isRequiredRelationField = computed(() => {
  return !!props.metadata?.inputField?.validation?.value?.includes(
    ValidationRules.HasRequiredRelation
  );
});
const isOneOfRequiredRelationField = computed(() => {
  return !!props.metadata?.inputField?.validation?.value?.includes(
    ValidationRules.HasOneOfRequiredRelations
  );
});
const isOneOfRequiredMetadataField = computed(() => {
  return !!props.metadata?.inputField?.validation?.value?.includes(
    ValidationRules.HasOneOfRequiredMetadata
  );
});

const isFieldRequired = computed(() => {
  if (
    props.metadata?.inputField?.validation?.value?.includes(
      ValidationRules.Required
    ) ||
    props.metadata?.inputField?.validation?.value?.includes(
      ValidationRules.HasRequiredRelation
    ) ||
    props.metadata?.inputField?.validation?.value?.includes(
      ValidationRules.HasOneOfRequiredRelations
    )
  )
    return true;
  if (props.metadata?.inputField?.validation?.required_if) {
    return conditionalFieldIsRequired(
      props.metadata?.inputField?.validation?.required_if,
      props.formId,
      mediafileViewerContext
    );
  }
  return false;
});

const getValidationRules = (metadata: PanelMetaData): string => {
  let rules: string;
  if (metadata?.inputField?.validation?.value === ValidationRules.CustomValue)
    rules = metadata?.inputField?.validation?.customValue;
  else rules = metadata?.inputField?.validation?.value?.join("|") as string;
  if (
    (isRequiredRelationField.value || isOneOfRequiredRelationField.value) &&
    !props.isEdit
  ) {
    return "required";
  }
  if (isRequiredRelationField.value) {
    const relationType =
      metadata?.inputField?.validation?.has_required_relation?.relationType;
    const amount =
      metadata?.inputField?.validation?.has_required_relation?.amount;
    return `${rules}:${amount}:${relationType}`;
  }
  if (isOneOfRequiredRelationField.value) {
    const relationTypes =
      metadata?.inputField?.validation?.has_one_of_required_relations?.relationTypes.join(
        ":"
      );
    const amount =
      metadata?.inputField?.validation?.has_one_of_required_relations?.amount;
    return `${rules}:${amount}:${relationTypes}`;
  }
  if (isOneOfRequiredMetadataField.value) {
    const relationTypes =
      metadata?.inputField?.validation?.has_one_of_required_metadata?.includedMetadataFields.join(
        ":"
      );
    const amount =
      metadata?.inputField?.validation?.has_one_of_required_metadata?.amount;
    return `${rules}:${amount}:${relationTypes}`;
  }
  if (isFieldRequired.value)
    return rules.includes(ValidationRules.Required)
      ? rules
      : `${rules}|required`;
  return rules;
};

const rules = computed(() => getValidationRules(props.metadata));
const label = computed(() =>
  props.metadata.label
    ? t(props.metadata.label as string)
    : t("metadata.no-label")
);

const veeValidateField = computed(() => {
  if (!props.metadata?.inputField && !props.linkedEntityId) {
    const key = fieldKeyWithId.value || props.metadata.key;
    return `${ValidationFields.IntialValues}.${key}`;
  }
  if (isMetadataOnRelation.value)
    return `${ValidationFields.RelationMetadata}.${fieldKeyWithId.value}`;
  else if (
    (isRequiredRelationField.value || isOneOfRequiredRelationField.value) &&
    !props.isEdit
  ) {
    return `${ValidationFields.IntialValues}.${getKeyBasedOnInputField(
      props.metadata
    )}`;
  } else if (
    isRequiredRelationField.value ||
    isOneOfRequiredRelationField.value
  ) {
    return `${ValidationFields.RelationValues}.${props.metadata.inputField.relationType}`;
  } else if (props.metadata.inputField)
    return `${ValidationFields.IntialValues}.${getKeyBasedOnInputField(
      props.metadata
    )}`;
  else if (props.linkedEntityId === undefined)
    return `${ValidationFields.RelationValues}.${props.metadata.key}`;
  else return `${ValidationFields.RelatedEntityData}.${fieldKeyWithId.value}`;
});

const { errorMessage, value, meta } = useField<
  string | BaseRelationValuesInput[]
>(veeValidateField, rules, { label: label });

onMounted(() => {
  if (props.metadata.hiddenField?.hidden) return;
  setNewValue(props.metadata.value);
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
    setNewValue(props.metadata.value);
  }
);
</script>
