<template>
  <div
    data-cy="metadata-wrapper"
    v-if="
      (!metadata.showOnlyInEditMode ||
        (metadata.showOnlyInEditMode && isEdit)) &&
      fieldIsPermittedToBeSeenByUser
    "
    :key="fieldLabel"
  >
    <metadata-title
      :metadata="metadata"
      :is-field-required="isFieldRequired"
      :is-one-of-required-metadata-field="
        isValidationRulePresentOnField(
          metadata,
          ValidationRules.HasOneOfRequiredMetadata,
        )
      "
      :is-one-of-required-relation-field="
        isValidationRulePresentOnField(
          metadata,
          ValidationRules.HasOneOfRequiredRelations,
        )
      "
    />
    <entity-element-metadata-edit
      v-if="isEdit && metadata.inputField && !metadata.nonEditableField"
      :fieldKey="fieldKey"
      :label="metadata.label as string"
      v-model:value="fieldValueProxy"
      :field="metadata.inputField"
      :hidden-field="metadata.hiddenField"
      :formId="formId"
      :formFlow="formFlow"
      :unit="metadata.unit"
      :link-text="metadata.linkText"
      :isMetadataOnRelation="fieldKind === 'PanelRelationData'"
      :isRootdataOnRelation="fieldKind === 'PanelRelationRootData'"
      :error="field.errorMessage"
      :relation-filter="metadata.inputField.relationFilter"
      :show-errors="
        showErrors ||
        (field.meta.dirty &&
          !isFieldValid &&
          metadata.inputField?.validation?.fastValidationMessage)
      "
      :field-is-valid="isFieldValid"
      :is-field-required="isFieldRequired"
      @click.stop.prevent
      @update:value="setNewFieldValue"
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
                v-if="metadata.formatter"
                v-bind="fieldValueProxy"
                :translation-key="metadata.valueTranslationKey"
                :entity="{ type: entityType }"
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
                :disabled="true"
                @click.stop.prevent
              />
              <ViewModesAutocompleteMetadata
                v-else-if="autoCompleteType === 'metadataAutocomplete'"
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
            :label="fieldLabel"
            v-model:value="metadataValueToDisplayOnTooltip"
            :link-text="metadata.linkText"
            :link-icon="metadata.linkIcon"
            :unit="metadata.unit"
            :base-library-mode="baseLibraryMode"
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
  type PanelRelationMetaData,
  type PanelRelationRootData,
  type Entitytyping,
  type BaseEntity,
  ValidationRules,
} from "@/generated-types/queries";
import { ref, onBeforeMount, computed } from "vue";
import ViewModesAutocompleteRelations from "@/components/library/view-modes/ViewModesAutocompleteRelations.vue";
import ViewModesAutocompleteMetadata from "@/components/library/view-modes/ViewModesAutocompleteMetadata.vue";
import BaseCopyToClipboard from "@/components/base/BaseCopyToClipboard.vue";
import MetadataTitle from "@/components/metadata/MetadataTitle.vue";
import { useMetadataWrapper } from "@/components/metadata/useMetadataWrapper";
import { useMetadataWrapperDropdownOptions } from "./useMetadataWrapperDropdownOptions";
import { useVeeValidate } from "./useVeeValidate";

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
};

const props = withDefaults(defineProps<MetadataWrapperProps>(), {
  baseLibraryMode: BaseLibraryModes.NormalBaseLibrary,
  formFlow: "edit",
  showErrors: false,
});

console.log(props.metadata);

const emit = defineEmits<{
  (event: "addRefetchFunctionToEditState"): void;
}>();

const {
  field,
  fieldIsPermittedToBeSeenByUser,
  fieldLabel,
  fieldKey,
  fieldKind,
  fieldType,
  fieldValueProxy,
  isFieldValid,
  isFieldRequired,
  setNewFieldValue,
} = useMetadataWrapper(props);
const {
  initializeDropdownStates,
  metadataKeyToGetOptions,
  filtersForRetrievingOptions,
  filtersForRetrievingRelatedOptions,
} = useMetadataWrapperDropdownOptions(props);
const { isValidationRulePresentOnField } = useVeeValidate();

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

const showTooltip = ref<boolean>(false);

const handleOverflowStatus = (status: boolean) => {
  showTooltip.value = status;
};

onBeforeMount(() => {
  if (autoCompleteType.value === "relationAutocomplete") {
    initializeDropdownStates();
  }
});
</script>
