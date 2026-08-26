<template>
  <div
    data-cy="metadata-wrapper"
    v-if="fieldIsPermittedToBeSeenByUser && fieldIsConditionallyVisible"
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
        :is-field-required="isFieldRequired"
        :is-one-of-required="isOneOfRequired"
      />
      <MultilingualLocaleSelector :field-key="metadata.key" />
      <BaseVirtualKeyboard
        v-if="(isEditingThisField || isCreateFlowField) && virtualKeyboardLayouts"
        :input="keyboardInput"
        :layouts="virtualKeyboardLayouts"
        :keyboard-class="safeKeyboardClass"
        @on-change="handleKeyboardChange"
        @is-open="handleKeyboardOpenState"
      />
    </div>
    <InlineFieldEditor
      v-if="
        (isEditingThisField && isFieldEditableInline) ||
        isGroupEditing ||
        isCreateFlowField
      "
      :is-dirty="isDirty"
      :is-saving="isSavingThisField"
      :error-message="editorErrorMessage"
      :multiline="isMultilineField"
      :show-commit-actions="!isGroupEditing && !isCreateFlowField"
      @save="fieldEditor.save()"
      @cancel="fieldEditor.cancel()"
    >
      <entity-element-metadata-edit
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
      :relation-filter="metadata.inputField?.relationFilter"
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
    </InlineFieldEditor>
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
            :class="{ 'field-row-value': isFieldEditableInline }"
            :role="isFieldEditableInline ? 'button' : undefined"
            :tabindex="isFieldEditableInline ? 0 : undefined"
            :aria-label="
              isFieldEditableInline
                ? t('field-row.edit-value', { label: fieldLabel })
                : undefined
            "
            data-cy="metadata-editable-value"
            @click="startEditing"
            @keydown.enter.prevent="startEditing"
            @keydown.space.prevent="startEditing"
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
                v-else-if="
                  fieldType === InputFieldTypes.InputFieldWithSubFields
                "
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
              <span
                v-else-if="fieldType === InputFieldTypes.Checkbox"
                data-cy="metadata-checkbox-value"
                class="metadata-boolean-value flex items-center gap-1"
              >
                <unicon
                  :name="
                    fieldValueProxy ? Unicons.Check.name : Unicons.Minus.name
                  "
                  class="-mx-1"
                  :class="
                    fieldValueProxy
                      ? 'metadata-boolean-value__yes'
                      : 'metadata-boolean-value__no'
                  "
                  height="18"
                />
                {{
                  fieldValueProxy
                    ? t("metadata.labels.yes")
                    : t("metadata.labels.no")
                }}
              </span>
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
            <SpinnerLoader
              v-if="isSavingThisField"
              data-cy="metadata-row-saving"
              :spinner-size="14"
            />
            <!-- Wrapped: vue-unicons renders a bare <svg> that scoped styles
                 cannot reach, so the class goes on an element we own. -->
            <span
              v-else-if="isSavedThisField"
              data-cy="metadata-row-saved"
              class="field-row-value__saved"
            >
              <unicon :name="Unicons.Check.name" height="14" />
            </span>
            <span
              v-else-if="isFieldEditableInline"
              class="field-row-value__pencil"
            >
              <unicon :name="Unicons.EditAlt.name" height="14" />
            </span>
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
      <!-- Stands beside the value until the next action, replacing the undo
           toast for saves (field-row.md §Round 2). -->
      <button
        v-if="canUndoThisField"
        type="button"
        class="field-row-value__undo"
        data-cy="metadata-row-undo"
        @click.stop="fieldEditor.undo()"
      >
        {{ t("inline-editor.undo") }}
      </button>
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
import {
  ref,
  onBeforeMount,
  onMounted,
  onUnmounted,
  computed,
  inject,
  provide,
  watch,
} from "vue";
import ViewModesAutocompleteRelations from "@/components/library/view-modes/ViewModesAutocompleteRelations.vue";
import ViewModesAutocompleteMetadata from "@/components/library/view-modes/ViewModesAutocompleteMetadata.vue";
import TableInputField from "@/components/tableInputFields/TableInputField.vue";
import BaseCopyToClipboard from "@/components/base/BaseCopyToClipboard.vue";
import MetadataTitle from "@/components/metadata/MetadataTitle.vue";
import MultilingualLocaleSelector from "@/components/metadata/MultilingualLocaleSelector.vue";
import InlineFieldEditor from "@/components/metadata/InlineFieldEditor.vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import { useFieldEditor } from "@/composables/useFieldEditor";
import type { useBlockEditor } from "@/composables/useBlockEditor";

type FieldGroupContext = ReturnType<typeof useBlockEditor>;
import { useMetadataWrapper } from "@/components/metadata/useMetadataWrapper";
import { useConditionalValidation } from "@/composables/useConditionalValidation";
import BaseVirtualKeyboard from "@/components/base/BaseVirtualKeyboard.vue";
import { useMetadataVirtualKeyboard } from "@/composables/useMetadataVirtualKeyboard";
import { useMetadataWrapperDropdownOptions } from "./useMetadataWrapperDropdownOptions";
import { useVeeValidate } from "./useVeeValidate";
import type { PanelRepetitionProps } from "@/composables/useRepeatableFields";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";

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

const { t } = useI18n();

const parentEntity: BaseEntity = inject("ParentEntityProvider", undefined);
const mediafileViewerContext = inject<string>("mediafileViewerContext", "");
const { fieldIsVisibleByCondition } = useConditionalValidation();

const fieldIsConditionallyVisible = computed(() =>
  fieldIsVisibleByCondition(
    (props.metadata.inputField as any)?.visibleIf,
    props.formId,
    mediafileViewerContext,
  ),
);

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
  () =>
    (props.metadata.inputField as any)?.virtualKeyboardConfig?.layouts ?? null,
);

const {
  keyboardSearchQuery,
  isKeyboardOpen,
  virtualKeyboardLayouts,
  keyboardInput,
  handleKeyboardChange,
  handleKeyboardOpenState,
} = useMetadataVirtualKeyboard(
  fieldType,
  fieldValueProxy,
  virtualKeyboardConfigLayouts,
);

provide("virtualKeyboardContext", {
  searchQuery: keyboardSearchQuery,
  isOpen: isKeyboardOpen,
});

// simple-keyboard uses the class as a CSS selector, so any character that is
// not a valid CSS identifier (colons, dots, slashes, spaces, …) must be replaced.
const safeKeyboardClass = computed(
  () => `virtual-keyboard-${fieldKey.value.replace(/[^a-zA-Z0-9-]/g, "_")}`,
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
  if (props.metadata.valueTranslationKey)
    return props.metadata.valueTranslationKey;
  const value = (props.metadata.value as any)?.label;
  const options = (props.metadata.inputField as any)?.options;
  if (!value || !options?.length) return undefined;
  const match = options.find((opt: any) => opt.value === value);
  return match?.label;
});

/* ── Per-field editing ───────────────────────────────────────────────────
   The row is its own edit, save and validation scope: it opens alone, commits
   alone and never validates a sibling (per-field-editing.md). */

const persistEntity = inject<(() => Promise<void>) | undefined>(
  "persistEntity",
  undefined,
);
/** Present only inside a panel that declared its fields interdependent. */
const fieldGroup = inject<FieldGroupContext | undefined>("fieldGroup", undefined);
const fieldEditor = useFieldEditor();

const scopeId = computed<string>(() => `${props.formId}:${fieldKey.value}`);

const isFieldEditableInline = computed<boolean>(() =>
  Boolean(
    props.metadata.inputField &&
      !props.metadata.nonEditableField &&
      fieldIsEditableByUser.value &&
      persistEntity,
  ),
);

const isEditingThisField = computed(() => fieldEditor.isEditing(scopeId.value));
const isSavingThisField = computed(() => fieldEditor.isSaving(scopeId.value));
const isSavedThisField = computed(() => fieldEditor.isSaved(scopeId.value));
const canUndoThisField = computed(() => fieldEditor.canUndo(scopeId.value));

const editorErrorMessage = computed<string | undefined>(() =>
  isEditingThisField.value ? fieldEditor.errorMessage.value : undefined,
);

const isMultilineField = computed<boolean>(
  () => fieldType.value === InputFieldTypes.Textarea,
);

/** The value as it stood when the editor opened, for cancel and dirty. */
const openedWith = ref<string>("");

const serialiseValue = (): string =>
  JSON.stringify(fieldValueProxy.value ?? null);

const isDirty = computed<boolean>(
  () => isEditingThisField.value && serialiseValue() !== openedWith.value,
);

const isGroupEditing = computed<boolean>(
  () => Boolean(fieldGroup?.isEditing.value) && isFieldEditableInline.value,
);

/* A creation form has no persisted value to fall back on: its rows render
   their inputs permanently, and the form's single submit zone commits —
   never a per-field Bewaar (dynamic-form.md). */
const isCreateFlowField = computed<boolean>(
  () =>
    props.formFlow === "create" &&
    Boolean(props.metadata.inputField) &&
    !props.metadata.nonEditableField &&
    fieldIsEditableByUser.value,
);

const startEditing = () => {
  if (!isFieldEditableInline.value || isEditingThisField.value) return;

  // One gesture: inside a group, a click on any member opens all of them.
  if (fieldGroup) {
    fieldGroup.open();
    return;
  }

  openedWith.value = serialiseValue();
  fieldEditor.open({
    id: scopeId.value,
    isDirty: () => isDirty.value,
    restore: () => {
      fieldValueProxy.value = JSON.parse(openedWith.value);
    },
    validate: async () => (await field.validate()).valid,
    submit: async () => {
      await persistEntity!();
    },
  });
};

/* A group commits as one, so it needs to reach every member's value. The row
   still owns that value; it only hands the group the three operations. */
if (fieldGroup) {
  onMounted(() =>
    fieldGroup.register({
      key: fieldKey.value,
      snapshot: serialiseValue,
      restore: (snapshot: string) => {
        fieldValueProxy.value = JSON.parse(snapshot);
      },
      validate: async () => (await field.validate()).valid,
    }),
  );
  onUnmounted(() => fieldGroup.unregister(fieldKey.value));
}

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

<style scoped>
/* Editability is signalled structurally: a dashed underline at rest, the
   accent wash and a pencil on hover, the one focus ring on focus
   (field-row.md). */
.field-row-value {
  border-bottom: 1px dashed var(--color-border-dashed);
  border-radius: var(--radius-input);
  padding: var(--spacing-ds-1) var(--spacing-ds-3);
  cursor: pointer;
  transition: background-color var(--transition-duration-ui) var(--ease-ui);
}

.field-row-value:hover {
  background-color: var(--color-surface-editable-hover);
}

.field-row-value:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 1px;
}

.field-row-value__pencil {
  display: inline-flex;
  color: var(--color-text-subtle);
  opacity: 0;
  transition: opacity var(--transition-duration-ui) var(--ease-ui);
}

.field-row-value:hover .field-row-value__pencil,
.field-row-value:focus-visible .field-row-value__pencil {
  opacity: 1;
}

.field-row-value__saved {
  display: inline-flex;
  color: var(--color-success);
}

/* A pill, because undo starts something reversible rather than executing. */
.field-row-value__undo {
  flex: none;
  align-self: center;
  padding: var(--spacing-ds-1) var(--spacing-ds-6);
  border: 1px solid var(--color-commit);
  border-radius: var(--radius-pill);
  background-color: var(--color-surface);
  color: var(--color-commit);
  font-size: var(--text-hint);
  white-space: nowrap;
}

.field-row-value__undo:hover {
  background-color: var(--color-surface-editable-hover);
}

.field-row-value__undo:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 1px;
}

/* A boolean reads as "Ja"/"Nee" with a check or a dash — never as a bare
   checkbox standing in for a value (field-row.md §Round 2). */
.metadata-boolean-value {
  font-size: var(--text-value);
}

.metadata-boolean-value__yes {
  color: var(--color-success);
}

.metadata-boolean-value__no {
  color: var(--color-text-muted);
}
</style>
