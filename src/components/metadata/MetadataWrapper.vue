<template>
  <div
    data-cy="metadata-wrapper"
    v-if="
      (!metadata.showOnlyInEditMode ||
        (metadata.showOnlyInEditMode && isEdit)) &&
      isPermitted
    "
    :key="label"
  >
    <metadata-title :metadata="metadata" />
    <entity-element-metadata-edit
      v-if="isEdit && metadata.inputField"
      :fieldKey="
        isMetadataOnRelation || isRootdataOnRelation
          ? `${fieldKeyWithId}`
          : metadata.key
      "
      :label="metadata.label as string"
      v-model:value="value"
      :field="metadata.inputField"
      :hidden-field="metadata.hiddenField"
      :formId="formId"
      :formFlow="formFlow"
      :unit="metadata.unit"
      :link-text="metadata.linkText"
      :isMetadataOnRelation="isMetadataOnRelation"
      :isRootdataOnRelation="isRootdataOnRelation"
      :error="errorMessage"
      :relation-filter="metadata.inputField.relationFilter"
      :show-errors="
        showErrors ||
        (meta.dirty &&
          !fieldIsValid &&
          metadata.inputField?.validation?.fastValidationMessage)
      "
      :field-is-valid="fieldIsValid"
      @click.stop.prevent
      @update:value="setNewValue"
    />
    <div v-else class="flex gap-2">
      <base-tooltip
        class="w-full basis-[fit-content]"
        position="right-end"
        :tooltip-offset="8"
      >
        <template #activator="{ on }">
          <div
            v-on="showTooltip ? on : {}"
            class="flex column gap-2 items-center"
          >
            <MetadataTruncatedText
              @overflow-status="handleOverflowStatus"
              :disabled="!linkedEntityId && !metadata.lineClamp"
              :line-clamp="metadata.lineClamp || 1"
            >
              <MetadataFormatter
                v-if="metadata.value?.formatter"
                v-bind="metadata.value"
              />
              <ViewModesAutocompleteRelations
                v-else-if="
                  (metadata.inputField?.type ===
                    InputFieldTypes.DropdownMultiselectRelations ||
                    metadata.inputField?.type ===
                      InputFieldTypes.DropdownSingleselectRelations) &&
                  metadata.value &&
                  !metadata.value?.formatter &&
                  metadata.value?.length > 0
                "
                v-model="metadata.value"
                :is-read-only="true"
                :field-name="metadata.label"
                :formId="formId"
                :metadata-key-to-get-options-for="
                  metadata.inputField.advancedFilterInputForSearchingOptions
                    ?.item_types?.[0]
                "
                :advanced-filter-input-for-retrieving-options="
                  metadata.inputField.advancedFilterInputForRetrievingOptions
                "
                :advanced-filter-input-for-retrieving-related-options="
                  metadata.inputField
                    .advancedFilterInputForRetrievingRelatedOptions
                "
                :advanced-filter-input-for-retrieving-all-options="
                  metadata.inputField.advancedFilterInputForRetrievingAllOptions
                "
                :relation-filter="metadata.inputField.relationFilter"
                :is-metadata-field="metadata.inputField?.isMetadataField"
                :relation-type="metadata.inputField?.relationType"
                :from-relation-type="metadata.inputField?.fromRelationType"
                :disabled="true"
                @click.stop.prevent
              />
              <ViewModesAutocompleteMetadata
                v-else-if="
                  metadata.inputField?.type ===
                    InputFieldTypes.DropdownMultiselectMetadata ||
                  metadata.inputField?.type ===
                    InputFieldTypes.DropdownSingleselectMetadata
                "
                v-model:model-value="metadata.value"
                :metadata-dropdown-options="metadata.inputField.options"
                :formId="formId"
                :select-type="
                  metadata.inputField.type ===
                  InputFieldTypes.DropdownSingleselectMetadata
                    ? 'single'
                    : 'multi'
                "
                :disabled="true"
                mode="view"
                @click.stop.prevent
              />
              <entity-element-metadata
                v-else
                :label="metadata.label as string"
                v-model:value="value"
                :link-text="metadata.linkText"
                :link-icon="metadata.linkIcon"
                :unit="metadata.unit"
                :base-library-mode="baseLibraryMode"
                :custom-value="metadata.customValue"
              />
            </MetadataTruncatedText>
            <BaseCopyToClipboard
              v-if="metadata.copyToClipboard"
              class="w-6 h-6"
              :value="metadata.value"
              @click.stop.prevent
            />
          </div>
        </template>
        <template #default>
          <entity-element-metadata
            class="text-text-placeholder"
            :label="metadata.label as string"
            v-model:value="metadataValueToDisplayOnTooltip"
            :link-text="metadata.linkText"
            :link-icon="metadata.linkIcon"
            :unit="metadata.unit"
            :base-library-mode="baseLibraryMode"
          />
        </template>
      </base-tooltip>
      <MetadataValueTooltip
        class="flex-grow-0 flex-shrink-0 basis-0 items-center"
        v-if="metadata.valueTooltip?.type && metadata.value"
        :value-tooltip="metadata.valueTooltip"
        :entity="metadata.value?.entity"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import EntityElementMetadataEdit from "@/components/metadata/EntityElementMetadataEdit.vue";
import EntityElementMetadata from "@/components/metadata/EntityElementMetadata.vue";
import MetadataFormatter from "@/components/metadata/MetadataFormatter.vue";
import MetadataTruncatedText from "./MetadataTruncatedText.vue";
import MetadataValueTooltip from "./MetadataValueTooltip.vue";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import {
  BaseLibraryModes,
  type PanelMetaData,
  InputFieldTypes,
  ValidationRules,
  ValidationFields,
  type BaseRelationValuesInput,
  type PanelRelationMetaData,
  type PanelRelationRootData,
} from "@/generated-types/queries";
import { computed, onMounted, watch, inject, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useField } from "vee-validate";
import { useConditionalValidation } from "@/composables/useConditionalValidation";
import { useFormHelper } from "@/composables/useFormHelper";
import ViewModesAutocompleteRelations from "@/components/library/view-modes/ViewModesAutocompleteRelations.vue";
import ViewModesAutocompleteMetadata from "@/components/library/view-modes/ViewModesAutocompleteMetadata.vue";
import { DateTime } from "luxon";
import BaseCopyToClipboard from "@/components/base/BaseCopyToClipboard.vue";
import { usePermissions } from "@/composables/usePermissions";
import MetadataTitle from "@/components/metadata/MetadataTitle.vue";

const { t } = useI18n();
const { getForm, getKeyBasedOnInputField } = useFormHelper();
const { fetchAdvancedPermission, setExtraVariables } = usePermissions();

const mediafileViewerContext: any = inject("mediafileViewerContext");

const props = withDefaults(
  defineProps<{
    isEdit: boolean;
    formId: string;
    metadata: PanelMetaData | PanelRelationMetaData | PanelRelationRootData;
    linkedEntityId?: String;
    baseLibraryMode?: BaseLibraryModes;
    formFlow?: "edit" | "create";
    showErrors?: boolean;
  }>(),
  {
    baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
    formFlow: "edit",
    showErrors: false,
  },
);

// Todo: Enabling this will break the validation
// Todo: Check if turning this off has other implications
// watch(
//   () => props.metadata,
//   (newvalue, oldvalue) => {
//     if (!Array.isArray(newvalue.value)) setNewValue(newvalue.value);
//   }
// );

const showTooltip = ref<boolean>(false);
const isPermitted = ref<boolean>(false);

const handleOverflowStatus = (status: boolean) => {
  showTooltip.value = status;
};

const setNewValue = (
  newValue:
    | string
    | string[]
    | BaseRelationValuesInput
    | BaseRelationValuesInput[],
) => {
  if (
    props.metadata?.inputField &&
    props.metadata.inputField.type === InputFieldTypes.Date
  ) {
    const parsedDate = DateTime.fromISO(newValue);
    if (parsedDate.isValid) value.value = parsedDate.toFormat("yyyy-MM-dd");
  } else {
    value.value = newValue;
  }

  const form = getForm(props.formId);
  if (form) {
    form.setFieldValue(veeValidateField.value, value.value);
  }
};

defineExpose({
  setNewValue,
});

const metadataValueToDisplayOnTooltip = computed(
  () => props.metadata?.value?.label || value.value,
);

const isMetadataOnRelation = computed(
  () => props.metadata.__typename === "PanelRelationMetaData",
);
const isRootdataOnRelation = computed(
  () => props.metadata.__typename === "PanelRelationRootData",
);
const fieldKeyWithId = computed(
  () =>
    `${props.metadata.key}${
      props.linkedEntityId ? "-" + props.linkedEntityId : ""
    }`,
);
const fieldIsValid = computed(() => meta.valid);

const { conditionalFieldIsRequired } = useConditionalValidation();

const isRequiredRelationField = computed(() => {
  return !!props.metadata?.inputField?.validation?.value?.includes(
    ValidationRules.HasRequiredRelation,
  );
});
const isOneOfRequiredRelationField = computed(() => {
  return !!props.metadata?.inputField?.validation?.value?.includes(
    ValidationRules.HasOneOfRequiredRelations,
  );
});
const isOneOfRequiredMetadataField = computed(() => {
  return !!props.metadata?.inputField?.validation?.value?.includes(
    ValidationRules.HasOneOfRequiredMetadata,
  );
});
const isRegexField = computed(() => {
  return !!props.metadata?.inputField?.validation?.value?.includes(
    ValidationRules.Regex,
  );
});

const isFieldRequired = computed(() => {
  if (
    props.metadata?.inputField?.validation?.value?.includes(
      ValidationRules.Required,
    ) ||
    props.metadata?.inputField?.validation?.value?.includes(
      ValidationRules.HasRequiredRelation,
    ) ||
    props.metadata?.inputField?.validation?.value?.includes(
      ValidationRules.HasOneOfRequiredRelations,
    )
  )
    return true;
  if (props.metadata?.inputField?.validation?.required_if) {
    return conditionalFieldIsRequired(
      props.metadata?.inputField?.validation?.required_if,
      props.formId,
      mediafileViewerContext,
    );
  }
  return false;
});

const isMaxDateToday = computed(() => {
  props.metadata?.inputField?.validation?.value?.includes(
    ValidationRules.MaxDateToday,
  );
});

const getValidationRules = (metadata: PanelMetaData): string => {
  let rules: string;
  if (metadata?.inputField?.validation?.value === ValidationRules.CustomValue)
    rules = metadata?.inputField?.validation?.customValue;
  else rules = metadata?.inputField?.validation?.value?.join("|") as string;
  if (isRegexField.value) {
    const rule = ValidationRules.Regex;
    let regex = metadata?.inputField?.validation?.regex?.replace(
      /^\/|\/$/g,
      "",
    );
    regex = regex?.replace(/\|/g, "?.");
    rules = `${rule}:${regex}`;
  }
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
    const exact =
      metadata?.inputField?.validation?.has_required_relation?.exact || false;
    return `${rules}:${amount}:${relationType}:${exact}`;
  }
  if (isOneOfRequiredRelationField.value) {
    const relationTypes =
      metadata?.inputField?.validation?.has_one_of_required_relations?.relationTypes.join(
        ":",
      );
    const amount =
      metadata?.inputField?.validation?.has_one_of_required_relations?.amount;
    return `${rules}:${amount}:${relationTypes}`;
  }
  if (isOneOfRequiredMetadataField.value) {
    const relationTypes =
      metadata?.inputField?.validation?.has_one_of_required_metadata?.includedMetadataFields.join(
        ":",
      );
    const amount =
      metadata?.inputField?.validation?.has_one_of_required_metadata?.amount;
    return `${rules}:${amount}:${relationTypes}`;
  }
  if (isFieldRequired.value)
    return rules.includes(ValidationRules.Required)
      ? rules
      : `${rules}|required`;
  if (isMaxDateToday.value) return rules;
  return rules;
};

const rules = computed(() => getValidationRules(props.metadata));
const label = computed(() =>
  props.metadata.label
    ? t(props.metadata.label as string)
    : t("metadata.no-label"),
);

const veeValidateField = computed(() => {
  if (!props.metadata?.inputField && !props.linkedEntityId) {
    const key = fieldKeyWithId.value || props.metadata.key;
    return `${ValidationFields.IntialValues}.${key}`;
  }
  if (isRegexField.value) {
    const key = fieldKeyWithId.value || props.metadata.key;
    return `${ValidationFields.IntialValues}.${key}`;
  }
  if (isMetadataOnRelation.value)
    return `${ValidationFields.RelationMetadata}.${fieldKeyWithId.value}`;
  if (isRootdataOnRelation.value)
    return `${ValidationFields.RelationRootdata}.${fieldKeyWithId.value}`;
  else if (
    (isRequiredRelationField.value || isOneOfRequiredRelationField.value) &&
    !props.isEdit
  ) {
    return `${ValidationFields.IntialValues}.${getKeyBasedOnInputField(
      props.metadata,
    )}`;
  } else if (
    isRequiredRelationField.value ||
    isOneOfRequiredRelationField.value
  ) {
    return `${ValidationFields.RelationValues}.${props.metadata.inputField.relationType}`;
  } else if (props.metadata.inputField)
    return `${ValidationFields.IntialValues}.${getKeyBasedOnInputField(
      props.metadata,
    )}`;
  else if (props.linkedEntityId === undefined)
    return `${ValidationFields.RelationValues}.${props.metadata.key}`;
  else return `${ValidationFields.RelatedEntityData}.${fieldKeyWithId.value}`;
});

const { errorMessage, value, meta } = useField<
  string | BaseRelationValuesInput[]
>(veeValidateField, rules, { label: label });

onMounted(async () => {
  await isPermittedToDisplay();
  if (props.metadata.hiddenField?.hidden) return;
  setNewValue(props.metadata.value);
});

const updatePermissionVariables = () => {
  setExtraVariables({
    parentEntityId: props.formId,
    childEntityId: "",
  });
};

const isPermittedToDisplay = async () => {
  const permissions = props.metadata.can;
  const hasPermissionsToCheck = permissions && permissions?.length > 0;

  if (!hasPermissionsToCheck) {
    isPermitted.value = true;
    return;
  }
  isPermitted.value = await fetchAdvancedPermission(permissions);
};

if (typeof props.metadata.value !== "object") {
  watch(
    () => props.metadata.value,
    () => {
      setNewValue(props.metadata.value);
    },
  );
}
watch(
  () => props.isEdit,
  () => {
    setNewValue(props.metadata.value);
  },
);

watch(
  () => props.formId,
  () => {
    updatePermissionVariables();
  },
  { immediate: true },
);
</script>
