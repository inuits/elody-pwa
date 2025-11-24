<template>
  <div
    data-cy="metadata-wrapper"
    v-if="
      (!refMetadata.showOnlyInEditMode ||
        (refMetadata.showOnlyInEditMode && isEdit)) &&
      isPermitted
    "
    :key="label"
  >
    <metadata-title
      :metadata="refMetadata"
      :is-field-required="isFieldRequired"
      :is-one-of-required-metadata-field="isOneOfRequiredMetadataField"
      :is-one-of-required-relation-field="isOneOfRequiredRelationField"
    />
    <entity-element-metadata-edit
      v-if="isEdit && refMetadata.inputField && !refMetadata.nonEditableField"
      :fieldKey="
        isMetadataOnRelation || isRootdataOnRelation
          ? `${fieldKeyWithId}`
          : refMetadata.key
      "
      :label="refMetadata.label as string"
      v-model:value="value"
      :field="refMetadata.inputField"
      :hidden-field="refMetadata.hiddenField"
      :formId="formId"
      :formFlow="formFlow"
      :unit="refMetadata.unit"
      :link-text="refMetadata.linkText"
      :isMetadataOnRelation="isMetadataOnRelation"
      :isRootdataOnRelation="isRootdataOnRelation"
      :error="errorMessage"
      :relation-filter="refMetadata.inputField.relationFilter"
      :show-errors="
        showErrors ||
        (meta.dirty &&
          !fieldIsValid &&
          refMetadata.inputField?.validation?.fastValidationMessage)
      "
      :field-is-valid="fieldIsValid"
      :is-field-required="isFieldRequired"
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
              :disabled="!linkedEntityId && !refMetadata.lineClamp"
              :line-clamp="refMetadata.lineClamp || 1"
            >
              <MetadataFormatter
                v-if="refMetadata.value?.formatter"
                v-bind="refMetadata.value"
                :translation-key="refMetadata.valueTranslationKey"
                :entity="{ type: entityType }"
              />
              <ViewModesAutocompleteRelations
                v-else-if="
                  refMetadata.inputField?.type ===
                    InputFieldTypes.DropdownMultiselectRelations ||
                  refMetadata.inputField?.type ===
                    InputFieldTypes.DropdownSingleselectRelations
                "
                v-model="refMetadata.value"
                :is-read-only="true"
                :field-name="refMetadata.label"
                :formId="linkedEntityId || formId"
                :metadata-key-to-get-options-for="
                  metadataKeyToGetOptionsForRelationDropdown
                "
                :advanced-filter-input-for-retrieving-options="
                  refMetadata.inputField.advancedFilterInputForRetrievingOptions
                "
                :advanced-filter-input-for-retrieving-related-options="
                  refMetadata.inputField
                    .advancedFilterInputForRetrievingRelatedOptions
                "
                :advanced-filter-input-for-retrieving-all-options="
                  refMetadata.inputField
                    .advancedFilterInputForRetrievingAllOptions
                "
                :advanced-filter-input-for-searching-options="
                  refMetadata.inputField.advancedFilterInputForSearchingOptions
                "
                :relation-filter="refMetadata.inputField.relationFilter"
                :is-metadata-field="refMetadata.inputField?.isMetadataField"
                :relation-type="refMetadata.inputField?.relationType"
                :from-relation-type="refMetadata.inputField?.fromRelationType"
                :disabled="true"
                @click.stop.prevent
              />
              <ViewModesAutocompleteMetadata
                v-else-if="
                  refMetadata.inputField?.type ===
                    InputFieldTypes.DropdownMultiselectMetadata ||
                  refMetadata.inputField?.type ===
                    InputFieldTypes.DropdownSingleselectMetadata
                "
                v-model:model-value="value"
                :metadata-dropdown-options="refMetadata.inputField.options"
                :formId="formId"
                :select-type="
                  refMetadata.inputField.type ===
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
                :label="refMetadata.label as string"
                v-model:value="value"
                :link-text="refMetadata.linkText"
                :link-icon="refMetadata.linkIcon"
                :unit="refMetadata.unit"
                :base-library-mode="baseLibraryMode"
                :custom-value="refMetadata.customValue"
                :translation-key="refMetadata.valueTranslationKey"
              />
            </MetadataTruncatedText>
            <BaseCopyToClipboard
              v-if="refMetadata.copyToClipboard"
              class="w-6 h-6"
              :value="refMetadata.value"
              @click.stop.prevent
            />
          </div>
        </template>
        <template #default>
          <entity-element-metadata
            class="text-text-placeholder"
            :label="refMetadata.label as string"
            v-model:value="metadataValueToDisplayOnTooltip"
            :link-text="refMetadata.linkText"
            :link-icon="refMetadata.linkIcon"
            :unit="refMetadata.unit"
            :base-library-mode="baseLibraryMode"
          />
        </template>
      </base-tooltip>
      <MetadataValueTooltip
        class="grow-0 shrink-0 basis-0 items-center"
        v-if="refMetadata.valueTooltip?.type && refMetadata.value"
        :value-tooltip="refMetadata.valueTooltip"
        :entity="refMetadata.value?.entity"
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
  CustomFormatterTypes,
  type BaseRelationValuesInput,
  type PanelRelationMetaData,
  type PanelRelationRootData,
  type Entitytyping,
  type BaseEntity,
} from "@/generated-types/queries";
import {
  computed,
  onMounted,
  watch,
  inject,
  ref,
  onBeforeMount,
  onUnmounted,
  toRef,
} from "vue";
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
import { useGetDropdownOptions } from "@/composables/useGetDropdownOptions";

const props = withDefaults(
  defineProps<{
    isEdit: boolean;
    formId: string;
    metadata: PanelMetaData | PanelRelationMetaData | PanelRelationRootData;
    linkedEntityId?: string;
    baseLibraryMode?: BaseLibraryModes;
    formFlow?: "edit" | "create";
    showErrors?: boolean;
    entityType?: Entitytyping;
    listItemEntity?: BaseEntity;
  }>(),
  {
    baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
    formFlow: "edit",
    showErrors: false,
  },
);

const emit = defineEmits<{
  (event: "addRefetchFunctionToEditState"): void;
}>();

const parentEntity: BaseEntity = inject("ParentEntityProvider");
const mediafileViewerContext: any = inject("mediafileViewerContext");
const { getForm, getKeyBasedOnInputField } = useFormHelper();
const { fetchAdvancedPermission, setExtraVariables } = usePermissions();
const { t } = useI18n();

const showTooltip = ref<boolean>(false);
const isPermitted = ref<boolean>(false);
const refMetadata = ref<
  PanelMetaData | PanelRelationMetaData | PanelRelationRootData
>(props.metadata);

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
  if (refMetadata.value.inputField?.type === InputFieldTypes.Dropdown) {
    console.log('updated to: ', newValue);
  }
  if (
    refMetadata.value?.inputField &&
    refMetadata.value.inputField.type === InputFieldTypes.Date
  ) {
    const parsedDate = DateTime.fromISO(newValue);
    if (parsedDate.isValid) value.value = parsedDate.toFormat("yyyy-MM-dd");
  } else if (refMetadata.value.value?.formatter === CustomFormatterTypes.Pill && typeof newValue === "string") {
    value.value = props.isEdit ? newValue : { ...refMetadata.value.value.formatter, label: newValue }
  } else {
    value.value = newValue;
  }

  const form = getForm(props.formId);
  if (!form) return;

  form.setFieldValue(veeValidateField.value, value.value);

  if (isMetadataOnRelation.value && props.isEdit && meta.dirty) {
    emit("addRefetchFunctionToEditState");
  }
};

defineExpose({
  setNewValue,
});

const metadataValueToDisplayOnTooltip = computed(
  () => refMetadata.value?.value?.label || value.value,
);

const isMetadataOnRelation = computed(
  () => refMetadata.value.__typename === "PanelRelationMetaData",
);
const isRootdataOnRelation = computed(
  () => refMetadata.value.__typename === "PanelRelationRootData",
);
const fieldKeyWithId = computed(
  () =>
    `${refMetadata.value.key}${
      props.linkedEntityId ? "-" + props.linkedEntityId : ""
    }`,
);
const fieldIsValid = computed(() => meta.valid);

const metadataKeyToGetOptionsForRelationDropdown = computed(() => {
  const field = refMetadata.value.inputField;
  if (field.entityType) return field.entityType;

  const fieldKey =
    isMetadataOnRelation.value || isRootdataOnRelation.value
      ? fieldKeyWithId.value
      : refMetadata.value.key;

  return field.advancedFilterInputForSearchingOptions?.item_types
    ? field.advancedFilterInputForSearchingOptions?.item_types[0]
    : fieldKey;
});

const { conditionalFieldIsRequired } = useConditionalValidation();

const isRequiredRelationField = computed(() => {
  return !!refMetadata.value?.inputField?.validation?.value?.includes(
    ValidationRules.HasRequiredRelation,
  );
});
const isOneOfRequiredRelationField = computed(() => {
  return !!refMetadata.value?.inputField?.validation?.value?.includes(
    ValidationRules.HasOneOfRequiredRelations,
  );
});
const isOneOfRequiredMetadataField = computed(() => {
  return !!refMetadata.value?.inputField?.validation?.value?.includes(
    ValidationRules.HasOneOfRequiredMetadata,
  );
});
const isRegexField = computed(() => {
  return !!refMetadata.value?.inputField?.validation?.value?.includes(
    ValidationRules.Regex,
  );
});

const isFieldRequired = computed(() => {
  if (
    refMetadata.value?.inputField?.validation?.value?.includes(
      ValidationRules.Required,
    ) ||
    refMetadata.value?.inputField?.validation?.value?.includes(
      ValidationRules.HasRequiredRelation,
    ) ||
    refMetadata.value?.inputField?.validation?.value?.includes(
      ValidationRules.HasOneOfRequiredRelations,
    )
  )
    return true;
  if (refMetadata.value?.inputField?.validation?.required_if) {
    return conditionalFieldIsRequired(
      refMetadata.value?.inputField?.validation?.required_if,
      props.formId,
      mediafileViewerContext,
    );
  }
  return false;
});

const unescapeString = (str: string | undefined): string => {
  return str.replace(/\\\\/g, "\\");
};

const getValidationRules = (metadata: PanelMetaData): string => {
  const validation = metadata?.inputField?.validation;
  if (!validation?.value) return "no_xss";

  let rules: string;
  if (validation.value === ValidationRules.CustomValue) {
    rules = validation.customValue;
  } else {
    rules = (validation.value as string[]).join("|");
  }

  if (isRegexField.value) {
    const rawRegex = validation.regex?.replace(/^\/|\/$/g, "") ?? "";
    const cleanedRegex = unescapeString(rawRegex.replace(/\|/g, "?.")).replace(
      /,/g,
      "?.c",
    );
    return `${ValidationRules.Regex}:${cleanedRegex}|no_xss`;
  }

  if (
    (isRequiredRelationField.value || isOneOfRequiredRelationField.value) &&
    !props.isEdit
  ) {
    return "required|no_xss";
  }

  if (isRequiredRelationField.value) {
    const {
      relationType,
      amount,
      exact = false,
    } = validation.has_required_relation ?? {};
    return `${rules}:${amount}:${relationType}:${exact}|no_xss`;
  }

  if (isOneOfRequiredRelationField.value) {
    const { relationTypes = [], amount } =
      validation.has_one_of_required_relations ?? {};
    return `${rules}:${amount}:${relationTypes.join(":")}|no_xss`;
  }

  if (isOneOfRequiredMetadataField.value) {
    const { includedMetadataFields = [], amount } =
      validation.has_one_of_required_metadata ?? {};
    return `${rules}:${amount}:${includedMetadataFields.join(":")}|no_xss`;
  }

  if (isFieldRequired.value) {
    const withRequired = rules.includes(ValidationRules.Required)
      ? rules
      : `${rules}|required`;
    return `${withRequired}|no_xss`;
  }

  return `${rules}|no_xss`;
};

const rules = computed(() => getValidationRules(refMetadata.value));
const label = computed(() =>
  refMetadata.value.label
    ? t(refMetadata.value.label as string)
    : t("metadata.no-label"),
);

const veeValidateField = computed(() => {
  if (!refMetadata.value?.inputField && !props.linkedEntityId) {
    const key = fieldKeyWithId.value || refMetadata.value.key;
    return `${ValidationFields.IntialValues}.${key}`;
  }
  if (isRegexField.value) {
    const key = fieldKeyWithId.value || refMetadata.value.key;
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
      refMetadata.value,
    )}`;
  } else if (
    isRequiredRelationField.value ||
    isOneOfRequiredRelationField.value
  ) {
    return `${ValidationFields.RelationValues}.${refMetadata.value.inputField.relationType}`;
  } else if (refMetadata.value.inputField)
    return `${ValidationFields.IntialValues}.${getKeyBasedOnInputField(
      refMetadata.value,
    )}`;
  else if (props.linkedEntityId === undefined)
    return `${ValidationFields.RelationValues}.${refMetadata.value.key}`;
  else return `${ValidationFields.RelatedEntityData}.${fieldKeyWithId.value}`;
});

const { errorMessage, value, meta } = useField<
  string | BaseRelationValuesInput[]
>(veeValidateField, rules, { label: label });

const updatePermissionVariables = () => {
  setExtraVariables({
    parentEntityId: props.formId,
    childEntityId: "",
  });
};

const isPermittedToDisplay = async () => {
  const permissions = refMetadata.value.can;
  const hasPermissionsToCheck = permissions && permissions?.length > 0;

  if (!hasPermissionsToCheck) {
    isPermitted.value = true;
    return;
  }
  isPermitted.value = await fetchAdvancedPermission(permissions);
};

const advancedFilterInputForRetrievingAllOptions = computed(() => {
  if (
    refMetadata.value.inputField.advancedFilterInputForRetrievingAllOptions
      .length > 0
  )
    return refMetadata.value.inputField
      .advancedFilterInputForRetrievingAllOptions;
  return refMetadata.value.inputField.advancedFilterInputForRetrievingOptions;
});
const advancedFilterInputForRetrievingRelatedOptions = computed(() => {
  if (
    refMetadata.value.inputField.advancedFilterInputForRetrievingRelatedOptions
      .length > 0
  )
    return refMetadata.value.inputField
      .advancedFilterInputForRetrievingRelatedOptions;
  return refMetadata.value.inputField.advancedFilterInputForRetrievingOptions;
});

const initializeDropdownOptionStates = () => {
  useGetDropdownOptions(
    `${props.linkedEntityId || props.formId}-${refMetadata.value.inputField?.relationType}-fetchAll`,
    "get",
    metadataKeyToGetOptionsForRelationDropdown.value as Entitytyping,
    toRef("fetchAll"),
    undefined,
    undefined,
    refMetadata.value.inputField.advancedFilterInputForSearchingOptions,
    advancedFilterInputForRetrievingAllOptions.value,
    props.linkedEntityId || props.formId,
  );
  useGetDropdownOptions(
    `${props.linkedEntityId || props.formId}-${refMetadata.value.inputField?.relationType}-fetchRelations`,
    "get",
    metadataKeyToGetOptionsForRelationDropdown.value as Entitytyping,
    props.listItemEntity !== undefined
      ? toRef(props.listItemEntity)
      : parentEntity,
    refMetadata.value.inputField?.relationType,
    refMetadata.value.inputField?.fromRelationType,
    refMetadata.value.inputField.advancedFilterInputForSearchingOptions,
    advancedFilterInputForRetrievingRelatedOptions.value,
    props.linkedEntityId || props.formId,
    refMetadata.value.inputField.relationFilter,
  );
};

const deleteDropdownOptionStates = () => {
  useGetDropdownOptions(
    `${props.linkedEntityId || props.formId}-${refMetadata.value.inputField?.relationType}-fetchAll`,
    "delete",
  );
  useGetDropdownOptions(
    `${props.linkedEntityId || props.formId}-${refMetadata.value.inputField?.relationType}-fetchRelations`,
    "delete",
  );
};

if (typeof refMetadata.value.value !== "object") {
  watch(
    () => refMetadata.value.value,
    () => {
      if (typeof refMetadata.value.value === "object") return;
      setNewValue(refMetadata.value.value);
    },
  );
}
watch(
  () => props.metadata,
  (newValue) => {
    refMetadata.value = newValue;
  },
);
watch(
  () => props.isEdit,
  () => {
    setNewValue(refMetadata.value.value);
  },
);
watch(
  () => props.formId,
  () => {
    updatePermissionVariables();
  },
  { immediate: true },
);

onMounted(async () => {
  await isPermittedToDisplay();
  if (refMetadata.value.hiddenField?.hidden) return;
  setNewValue(refMetadata.value.value);
});
onBeforeMount(() => {
  if (
    refMetadata.value.inputField?.type ===
      InputFieldTypes.DropdownMultiselectRelations ||
    refMetadata.value.inputField?.type ===
      InputFieldTypes.DropdownSingleselectRelations
  )
    initializeDropdownOptionStates();
});
onUnmounted(() => {
  deleteDropdownOptionStates();
});
</script>
