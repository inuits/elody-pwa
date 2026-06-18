<template>
  <div
    data-cy="metadata-wrapper"
    v-if="
      (!metadata.showOnlyInEditMode ||
        (metadata.showOnlyInEditMode && isEdit)) &&
      fieldIsPermittedToBeSeenByUser
    "
    :key="fieldLabel"
    :class="{
      relative: fieldType === InputFieldTypes.InputFieldWithSubFields,
    }"
  >
    <div class="flex items-center gap-2">
      <metadata-title
        :class="{
          'pb-2': fieldType === InputFieldTypes.InputFieldWithSubFields,
        }"
        :metadata="metadata"
        :is-field-required="isFieldRequired && isEdit"
        :is-one-of-required="isOneOfRequired && isEdit"
      />
      <MultilingualLocaleSelector :field-key="metadata.key" />
      <BaseVirtualKeyboard
        v-if="isEdit && virtualKeyboardLayouts"
        :input="keyboardInput"
        :layouts="virtualKeyboardLayouts"
        :keyboard-class="safeKeyboardClass"
        @on-change="handleKeyboardChange"
        @is-open="handleKeyboardOpenState"
      />
    </div>
    <entity-element-metadata-edit
      v-if="
        isEdit &&
        metadata.inputField &&
        !metadata.nonEditableField &&
        fieldIsEditableByUser
      "
      :fieldKey="fieldKey"
      v-model:value="fieldValueProxy"
      :field="metadata.inputField"
      :hidden-field="metadata.hiddenField"
      :formId="formId"
      :formFlow="formFlow"
      :unit="metadata.unit"
      :link-text="metadata.linkText"
      :isMetadataOnRelation="fieldKind === 'PanelRelationData'"
      :isRootdataOnRelation="fieldKind === 'PanelRelationRootData'"
      :error="fieldErrorMessage"
      :relation-filter="metadata.inputField.relationFilter"
      :show-errors="
        showErrors ||
        (field.meta.dirty &&
          !isFieldValid &&
          metadata.inputField?.validation?.fastValidationMessage)
      "
      :copy-value-from-parent="metadata.copyValueFromParent"
      :extract-value-from-parent="extractIntialValueFromParentByKey"
      :field-is-valid="isFieldValid"
      :is-field-required="isFieldRequired"
      :repeatable-panel-config="repeatablePanelConfig"
      :disabled="metadata.disabled"
      :default-value="metadata.defaultValue"
      @click.stop.prevent
      @update:value="(value) => (fieldValueProxy = value)"
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
                :translation-key="pillTranslationKey"
                :unit="metadata.unit"
                :entity="{ type: entityType }"
              />
              <TableInputField
                v-else-if="fieldType === InputFieldTypes.InputFieldWithSubFields"
                v-model:model-value="fieldValueProxy"
                :is-flow-relation-values="
                  !metadata.inputField?.isMetadataField &&
                  metadata.inputField?.relationType !== undefined
                "
                :sub-fields="(metadata.inputField as any)?.subFields ?? []"
                :form-id="formId"
                :parent-field-key="fieldKey"
                :relation-type="metadata.inputField?.relationType"
                :disabled="true"
              />
              <ViewModesAutocompleteRelations
                v-else-if="autoCompleteType === 'relationAutocomplete'"
                v-model="fieldValueProxy"
                :is-read-only="true"
                :field-name="fieldLabel"
                :formId="linkedEntityId || formId"
                :metadata-key-to-get-options-for="metadataKeyToGetOptions"
                :advanced-filter-input-for-retrieving-options="
                  metadata.inputField.advancedFilterInputForRetrievingOptions
                "
                :advanced-filter-input-for-retrieving-related-options="
                  filtersForRetrievingRelatedOptions
                "
                :advanced-filter-input-for-retrieving-all-options="
                  filtersForRetrievingOptions
                "
                :advanced-filter-input-for-searching-options="
                  metadata.inputField.advancedFilterInputForSearchingOptions
                "
                :relation-filter="metadata.inputField.relationFilter"
                :is-metadata-field="metadata.inputField?.isMetadataField"
                :relation-type="metadata.inputField?.relationType"
                :from-relation-type="metadata.inputField?.fromRelationType"
                :metadataOnRelationConfig="
                  metadata.inputField?.metadataOnRelationFieldConfig
                "
                :disabled="true"
                :readOnlyValueAsPlainText="
                  metadata.inputField?.readOnlyValueAsPlainText
                "
                @click.stop.prevent
              />
              <ViewModesAutocompleteMetadata
                v-else-if="
                  autoCompleteType === 'metadataAutocomplete' &&
                  (metadata.unit !== Unit.Image ||
                    imageLoadError ||
                    !fieldValueProxy)
                "
                v-model:model-value="fieldValueProxy"
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
              <img
                v-else-if="
                  metadata.unit === Unit.Image &&
                  fieldValueProxy &&
                  !imageLoadError
                "
                :src="`/${fieldValueProxy}`"
                class="max-h-12 py-2"
                alt=""
                data-testid="unit-image"
                @error="imageLoadError = true"
              />
              <entity-element-metadata
                v-else
                :label="fieldLabel"
                v-model:value="fieldValueProxy"
                :link-text="metadata.linkText"
                :link-icon="metadata.linkIcon"
                :unit="metadata.unit"
                :base-library-mode="baseLibraryMode"
                :custom-value="metadata.customValue"
                :translation-key="metadata.valueTranslationKey"
                :breakWords="breakWords"
              />
            </MetadataTruncatedText>
            <BaseCopyToClipboard
              v-if="metadata.copyToClipboard"
              class="w-6 h-6"
              :value="fieldValueProxy"
              @click.stop.prevent
            />
          </div>
        </template>
        <template #default>
          <entity-element-metadata
            class="text-text-placeholder"
            :label="fieldLabel"
            v-model:value="fieldTooltipValue"
            :link-text="metadata.linkText"
            :link-icon="metadata.linkIcon"
            :unit="metadata.unit"
            :base-library-mode="baseLibraryMode"
            :break-words="breakWords"
          />
        </template>
      </base-tooltip>
      <MetadataValueTooltip
        class="grow-0 shrink-0 basis-0 items-center"
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
  Unit,
  type PanelRelationMetaData,
  type PanelRelationRootData,
  type Entitytyping,
  type BaseEntity,
  ValidationRules,
} from "@/generated-types/queries";
import { ref, onBeforeMount, computed, inject, provide, watch } from "vue";
import ViewModesAutocompleteRelations from "@/components/library/view-modes/ViewModesAutocompleteRelations.vue";
import ViewModesAutocompleteMetadata from "@/components/library/view-modes/ViewModesAutocompleteMetadata.vue";
import TableInputField from "@/components/tableInputFields/TableInputField.vue";
import BaseCopyToClipboard from "@/components/base/BaseCopyToClipboard.vue";
import MetadataTitle from "@/components/metadata/MetadataTitle.vue";
import MultilingualLocaleSelector from "@/components/metadata/MultilingualLocaleSelector.vue";
import { useMetadataWrapper } from "@/components/metadata/useMetadataWrapper";
import BaseVirtualKeyboard from "@/components/base/BaseVirtualKeyboard.vue";
import { useMetadataVirtualKeyboard } from "@/composables/useMetadataVirtualKeyboard";
import { useMetadataWrapperDropdownOptions } from "./useMetadataWrapperDropdownOptions";
import { useVeeValidate } from "./useVeeValidate";
import type { PanelRepetitionProps } from "@/composables/useRepeatableFields";

export type MetadataWrapperProps = {
  isEdit: boolean;
  formId: string;
  metadata: PanelMetaData | PanelRelationMetaData | PanelRelationRootData;
  linkedEntityId?: string;
  baseLibraryMode?: BaseLibraryModes;
  formFlow?: "edit" | "create";
  showErrors?: boolean;
  entityType?: Entitytyping;
  listItemEntity?: BaseEntity;
  breakWords?: boolean;
  repeatablePanelConfig?: PanelRepetitionProps;
  isUsedInModal?: boolean;
};

const props = withDefaults(defineProps<MetadataWrapperProps>(), {
  baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
  formFlow: "edit",
  showErrors: false,
  breakWords: false,
  isUsedInModal: false,
});

const emit = defineEmits<{
  (event: "addRefetchFunctionToEditState"): void;
  (event: "update:metadata", mutatedField: PanelMetaData): void;
}>();

const parentEntity: BaseEntity = inject("ParentEntityProvider", undefined);

const {
  field,
  fieldIsPermittedToBeSeenByUser,
  fieldIsEditableByUser,
  fieldLabel,
  fieldKey,
  isFormatterField,
  fieldKind,
  fieldType,
  fieldValueProxy,
  isFieldValid,
  isFieldRequired,
  fieldTooltipValue,
  fieldErrorMessage,
  extractIntialValueFromParentByKey,
} = useMetadataWrapper(props, () => emit("addRefetchFunctionToEditState"));
const {
  initializeDropdownStates,
  metadataKeyToGetOptions,
  filtersForRetrievingOptions,
  filtersForRetrievingRelatedOptions,
} = useMetadataWrapperDropdownOptions(props, parentEntity);
const { isValidationRulePresentOnField } = useVeeValidate();

const virtualKeyboardConfigLayouts = computed(
  () => (props.metadata.inputField as any)?.virtualKeyboardConfig?.layouts ?? null,
);

const {
  keyboardSearchQuery,
  isKeyboardOpen,
  virtualKeyboardLayouts,
  keyboardInput,
  handleKeyboardChange,
  handleKeyboardOpenState,
} = useMetadataVirtualKeyboard(fieldType, fieldValueProxy, virtualKeyboardConfigLayouts);

provide("virtualKeyboardContext", {
  searchQuery: keyboardSearchQuery,
  isOpen: isKeyboardOpen,
});

// simple-keyboard uses the class as a CSS selector, so any character that is
// not a valid CSS identifier (colons, dots, slashes, spaces, …) must be replaced.
const safeKeyboardClass = computed(() =>
  `virtual-keyboard-${fieldKey.value.replace(/[^a-zA-Z0-9-]/g, "_")}`,
);

const autoCompleteType = computed<
  "metadataAutocomplete" | "relationAutocomplete" | undefined
>(() => {
  const relationAutocompleteTypes = [
    InputFieldTypes.DropdownMultiselectRelations,
    InputFieldTypes.DropdownSingleselectRelations,
  ];
  const metadataAutocompleteTypes = [
    InputFieldTypes.DropdownMultiselectMetadata,
    InputFieldTypes.DropdownSingleselectMetadata,
  ];

  if (!fieldType.value) return undefined;
  if (relationAutocompleteTypes.includes(fieldType.value as InputFieldTypes))
    return "relationAutocomplete";
  if (metadataAutocompleteTypes.includes(fieldType.value as InputFieldTypes))
    return "metadataAutocomplete";
  return undefined;
});

const pillTranslationKey = computed<string | undefined>(() => {
  if (props.metadata.valueTranslationKey) return props.metadata.valueTranslationKey;
  const value = (props.metadata.value as any)?.label;
  const options = (props.metadata.inputField as any)?.options;
  if (!value || !options?.length) return undefined;
  const match = options.find((opt: any) => opt.value === value);
  return match?.label;
});

const showTooltip = ref<boolean>(false);
const imageLoadError = ref<boolean>(false);

const handleOverflowStatus = (status: boolean) => {
  showTooltip.value = status;
};

const isOneOfRequired = computed(
  () =>
    isOneOfRequiredMetadataField.value || isOneOfRequiredRelationField.value,
);

const isOneOfRequiredMetadataField = computed(() => {
  return isValidationRulePresentOnField({
    metadata: props.metadata,
    rule: ValidationRules.HasOneOfRequiredMetadata,
  });
});

const isOneOfRequiredRelationField = computed(() => {
  return isValidationRulePresentOnField({
    metadata: props.metadata,
    rule: ValidationRules.HasOneOfRequiredRelations,
  });
});

onBeforeMount(() => {
  if (autoCompleteType.value === "relationAutocomplete") {
    initializeDropdownStates();
  }
});

watch(
  () => fieldValueProxy,
  () => {
    imageLoadError.value = false;
    const value = isFormatterField.value
      ? { ...(props.metadata.value as object), label: fieldValueProxy.value }
      : fieldValueProxy.value;
    emit("update:metadata", {
      ...props.metadata,
      value,
    } as PanelMetaData);
  },
  { deep: true },
);
</script>
