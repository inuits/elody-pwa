<template>
  <div
    data-cy="metadata-wrapper"
    v-if="
      (!metadata.showOnlyInEditMode ||
        (metadata.showOnlyInEditMode && isEdit)) &&
      fieldIsPermittedToBeSeenByUser &&
      fieldIsConditionallyVisible
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
        :is-field-required="isFieldRequired && (isEdit || canEditInPlace)"
        :is-one-of-required="isOneOfRequired && (isEdit || canEditInPlace)"
        :is-locked="fieldIsLocked"
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
    <div
      v-if="
        isEdit &&
        metadata.inputField &&
        !metadata.nonEditableField &&
        fieldIsEditableByUser &&
        !fieldIsLocked
      "
      class="flex items-center gap-2"
    >
      <entity-element-metadata-edit
        data-cy="metadata-input"
        class="grow min-w-0"
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
        :field-is-valid="isFieldValid"
        :is-field-required="isFieldRequired"
        :repeatable-panel-config="repeatablePanelConfig"
        :disabled="metadata.disabled"
        :default-value="metadata.defaultValue"
        @click.stop.prevent
        @update:value="(value) => (fieldValueProxy = value)"
      />
      <div
        v-if="copyFromParentButton"
        data-testid="copy-from-parent-action"
        class="shrink-0 w-fit"
      >
        <base-button-new
          data-cy="copy-from-parent"
          :label="t(copyFromParentButton.label)"
          button-style="commit"
          button-size="sm"
          force-show-label
          @click="copyFromParentButton.copy()"
        />
      </div>
      <slot name="fieldAction" />
    </div>
    <InlineFieldEditor
      v-if="isEditingInPlace"
      :type="fieldType ?? ''"
      :model-value="valueBeforeEditing"
      :label="t(metadata.label ?? '')"
      :options="(metadata.inputField?.options as any) ?? []"
      :required="isFieldRequired"
      :saving="inlineSaving"
      :error-message="inlineError"
      :dirty="isRelationField ? relationDirty : undefined"
      @save="saveInline"
      @cancel="cancelInline"
      @dirty-change="inlineDirty = $event"
      @draft-change="latestDraft = $event"
    >
      <!-- Relations: the edit-mode autocomplete writes the selection into
           the form's relationValues; the editor saves only the difference. -->
      <template v-if="isRelationField" #input>
        <ViewModesAutocompleteRelations
          :editing="true"
          mode="edit"
          :model-value="fieldValueProxy"
          :form-id="formId"
          :metadata-key-to-get-options-for="metadataKeyToGetOptions"
          :select-type="
            fieldType === InputFieldTypes.DropdownSingleselectRelations
              ? 'single'
              : 'multi'
          "
          :relation-type="metadata.inputField.relationType"
          :from-relation-type="metadata.inputField.fromRelationType"
          :advanced-filter-input-for-retrieving-options="
            metadata.inputField.advancedFilterInputForRetrievingOptions
          "
          :advanced-filter-input-for-retrieving-related-options="
            metadata.inputField.advancedFilterInputForRetrievingRelatedOptions
          "
          :advanced-filter-input-for-retrieving-all-options="
            metadata.inputField.advancedFilterInputForRetrievingAllOptions
          "
          :advanced-filter-input-for-searching-options="
            metadata.inputField.advancedFilterInputForSearchingOptions
          "
          :is-metadata-field="metadata.inputField.isMetadataField"
          :relation-filter="metadata.inputField.relationFilter"
          :auto-selectable="metadata.inputField.autoSelectable"
          :disabled="inlineSaving"
          :can-create-option="metadata.inputField.canCreateEntityFromOption"
          :metadata-key-to-create-entity-from-option="
            metadata.inputField.metadataKeyToCreateEntityFromOption
          "
          :depends-on="metadata.inputField.dependsOn"
          :metadata-on-relation-config="
            metadata.inputField.metadataOnRelationFieldConfig
          "
        />
      </template>
    </InlineFieldEditor>
    <p data-cy="inline-save-status" role="status" class="sr-only">
      {{ savedAnnouncement }}
    </p>
    <div
      v-if="
        !(
          isEdit &&
          metadata.inputField &&
          !metadata.nonEditableField &&
          fieldIsEditableByUser &&
          !fieldIsLocked
        ) && !isEditingInPlace
      "
      data-testid="locked-field-view-container"
      class="relative flex gap-2"
      :class="[
        {
          'locked-field p-1 bg-background-normal/70 rounded-md': fieldIsLocked,
        },
      ]"
    >
      <locked-field-indicator
        v-if="fieldIsLocked"
        :is-locked="fieldIsLocked"
        position="middle-right"
        :tooltip="(metadata as any).lockedTooltip"
      />
      <base-tooltip
        class="w-full basis-[fit-content]"
        position="right-end"
        :tooltip-offset="8"
      >
        <template #activator="{ on, describedBy }">
          <div
            ref="fieldValueRef"
            data-cy="field-value"
            v-on="showTooltip ? on : {}"
            :aria-describedby="showTooltip ? describedBy : undefined"
            class="flex column gap-2 items-center min-h-(--field-value-min-height)"
            :class="
              canEditInPlace
                ? 'cursor-pointer rounded-input px-(--field-value-pad-x) -mx-(--field-value-pad-x) py-(--field-value-pad-y) -my-(--field-value-pad-y) hover:bg-surface-editable-hover'
                : undefined
            "
            v-bind="editableValueAttrs"
            @click.capture="startEditing"
            @keydown.enter="onActivateKey"
            @keydown.space="onActivateKey"
          >
            <MetadataMaskedValue
              v-if="isMaskedField"
              :metadata-key="metadata.key"
              :value="fieldValueProxy"
              :reveal-query="metadata.revealQuery"
              :entity-id="linkedEntityId || formId"
              :copy-to-clipboard="metadata.copyToClipboard ?? false"
            />
            <MetadataTruncatedText
              v-else
              data-cy="field-value-text"
              :class="{
                'border-b border-dashed border-border-dashed': underlineValue,
              }"
              @overflow-status="handleOverflowStatus"
              :disabled="!linkedEntityId && !metadata.lineClamp"
              :line-clamp="metadata.lineClamp || 1"
            >
              <MetadataFormatter
                v-if="resolvedMetadataValue?.formatter"
                v-bind="resolvedMetadataValue"
                :translation-key="pillTranslationKey"
                :value-options="metadata.inputField?.options"
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
                class="flex items-center gap-1 text-sm"
              >
                <unicon
                  :name="
                    fieldValueProxy ? Unicons.Check.name : Unicons.Cross.name
                  "
                  class="-mx-1"
                  :class="fieldValueProxy ? 'text-green-600' : 'text-gray-600'"
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
                :class="{ 'pr-6': fieldIsLocked }"
                :label="fieldLabel"
                v-model:value="fieldValueProxy"
                :link-text="metadata.linkText"
                :link-icon="metadata.linkIcon"
                :unit="metadata.unit"
                :base-library-mode="baseLibraryMode"
                :custom-value="metadata.customValue"
                :translation-key="pillTranslationKey"
                :breakWords="breakWords"
              />
            </MetadataTruncatedText>
            <span
              v-if="canEditInPlace"
              data-cy="field-edit-pencil"
              aria-hidden="true"
              class="ml-auto flex shrink-0 text-text-subtle"
            >
              <unicon :name="Unicons.EditAlt.name" height="12" />
            </span>
            <BaseCopyToClipboard
              data-inline-edit-ignore
              v-if="metadata.copyToClipboard && !isMaskedField"
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
import MetadataMaskedValue from "@/components/metadata/MetadataMaskedValue.vue";
import { resolveValueTranslationKey } from "@/components/metadata/useValueTranslationKey";
import {
  BaseLibraryModes,
  Collection,
  type PanelMetaData,
  InputFieldTypes,
  Unit,
  type PanelRelationMetaData,
  type PanelRelationRootData,
  type Entitytyping,
  type BaseEntity,
  EditStatus,
  ValidationFields,
  ValidationRules,
} from "@/generated-types/queries";
import {
  ref,
  onBeforeMount,
  computed,
  inject,
  provide,
  watch,
  nextTick,
} from "vue";
import ViewModesAutocompleteRelations from "@/components/library/view-modes/ViewModesAutocompleteRelations.vue";
import ViewModesAutocompleteMetadata from "@/components/library/view-modes/ViewModesAutocompleteMetadata.vue";
import TableInputField from "@/components/tableInputFields/TableInputField.vue";
import BaseCopyToClipboard from "@/components/base/BaseCopyToClipboard.vue";
import MetadataTitle from "@/components/metadata/MetadataTitle.vue";
import LockedFieldIndicator from "@/components/metadata/LockedFieldIndicator.vue";
import MultilingualLocaleSelector from "@/components/metadata/MultilingualLocaleSelector.vue";
import { useMetadataWrapper } from "@/components/metadata/useMetadataWrapper";
import { useConditionalValidation } from "@/composables/useConditionalValidation";
import BaseVirtualKeyboard from "@/components/base/BaseVirtualKeyboard.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { copyFromParentContextKey } from "@/composables/useCopyFromParent";
import { useMetadataVirtualKeyboard } from "@/composables/useMetadataVirtualKeyboard";
import { useMetadataWrapperDropdownOptions } from "./useMetadataWrapperDropdownOptions";
import { useVeeValidate } from "./useVeeValidate";
import type { PanelRepetitionProps } from "@/composables/useRepeatableFields";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";
import {
  canUpdateEntity,
  isInnerControlClick,
  useInPlaceScope,
} from "@/composables/useInPlaceScope";
import { useEditMode } from "@/composables/useEdit";
import { canEditFieldInPlace } from "@/components/metadata/fieldEditability";
import InlineFieldEditor from "@/components/metadata/InlineFieldEditor.vue";
import {
  asListIfNeeded,
  buildMetadataInput,
  buildRelationsInput,
  saveScope,
  toMetadataValue,
  validateRelations,
  validateScope,
  type RelationValue,
} from "@/composables/useScopedSave";
import { useFormHelper } from "@/composables/useFormHelper";
import { useFieldValidation } from "@/components/metadata/useFieldValidation";

export type MetadataWrapperProps = {
  isEdit: boolean;
  formId: string;
  metadata: PanelMetaData | PanelRelationMetaData | PanelRelationRootData;
  linkedEntityId?: string;
  relationType?: string;
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
  fieldIsLocked,
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
  resolvedMetadataValue,
} = useMetadataWrapper(props, () => emit("addRefetchFunctionToEditState"));

const isMaskedField = computed(
  () => (props.metadata as PanelMetaData).masked === true,
);

const copyFromParent = inject(copyFromParentContextKey, undefined);

const copyFromParentButton = computed(() => {
  if (!props.isEdit) return undefined;
  return copyFromParent?.buttonFor(props.metadata as PanelMetaData);
});
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

const pillTranslationKey = computed<string | undefined>(() =>
  resolveValueTranslationKey(props.metadata),
);

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

// Per-field editing: an editable value is a button that opens its own edit
// scope (docs/design-system/patterns/per-field-editing.md).
const editScopeId = computed(() => `${props.formId}:${props.metadata.key}`);
const inPlaceScope = useInPlaceScope(() => editScopeId.value);
const entityEditState = useEditMode(props.formId);
const entityCanUpdate = computed<boolean>(() =>
  canUpdateEntity(entityEditState),
);
// Relations edit in place when the field saves as the entity's own relations
// (not as metadata, not on a linked entity, not inherited).
const isRelationField = computed<boolean>(
  () => autoCompleteType.value === "relationAutocomplete",
);
const relationTypeOfField = computed<string | undefined>(
  () => props.metadata.inputField?.relationType || undefined,
);
const relationEditable = computed<boolean>(
  () =>
    isRelationField.value &&
    !!relationTypeOfField.value &&
    !props.metadata.inputField?.isMetadataField &&
    !props.linkedEntityId &&
    !(props.metadata as PanelMetaData).hiddenField?.inherited,
);
const canEditInPlace = computed<boolean>(() =>
  canEditFieldInPlace({
    inputFieldType: props.metadata.inputField?.type,
    nonEditableField: props.metadata.nonEditableField ?? false,
    editableByUser: fieldIsEditableByUser.value,
    locked: fieldIsLocked.value,
    masked: isMaskedField.value,
    entityCanUpdate: entityCanUpdate.value,
    pageInEditMode: props.isEdit,
    multilingual: (props.metadata as PanelMetaData).isMultilingual === true,
    onRelation: ["PanelRelationMetaData", "PanelRelationRootData"].includes(
      fieldKind.value,
    ),
    repeatable: !!props.repeatablePanelConfig?.isRepeatable,
    relationEditable: relationEditable.value,
  }),
);
const editFieldLabel = computed<string>(() => inPlaceScope.messages.editField());
const editableValueAttrs = computed(() =>
  canEditInPlace.value
    ? {
        role: "button",
        tabindex: 0,
        "aria-label": `${t(props.metadata.label ?? "")}, ${editFieldLabel.value}`,
      }
    : {},
);
const isEditingInPlace = ref<boolean>(false);
const inlineDirty = ref<boolean>(false);
const inlineSaving = ref<boolean>(false);
const inlineError = ref<string | undefined>(undefined);
const savedAnnouncement = ref<string>("");
const valueBeforeEditing = ref<unknown>(undefined);
const latestDraft = ref<unknown>(undefined);
const fieldValueRef = ref<HTMLElement | null>(null);
// From EntityForm; onSaved hands a saved entity back to the page, as the
// whole-form save did, so everything rendered from the entity is current.
const entityFormData = inject<
  | {
      id?: string;
      collection?: Collection;
      onSaved?: (savedEntity: unknown) => void;
    }
  | undefined
>("entityFormData", undefined);

const focusFieldValue = async () => {
  await nextTick();
  fieldValueRef.value?.focus();
};
const closeEditor = () => {
  isEditingInPlace.value = false;
  inlineDirty.value = false;
  inlineError.value = undefined;
  inPlaceScope.release();
};
// --- Relations -------------------------------------------------------------
const { getForm } = useFormHelper();
const { getValidationRules } = useFieldValidation(
  () => props.metadata.inputField?.validation,
);
const relationsPath = computed(
  () => `${ValidationFields.RelationValues}.${relationTypeOfField.value}`,
);
const formRelations = (): unknown[] => {
  const relations =
    getForm(props.formId)?.values?.relationValues?.[
      relationTypeOfField.value ?? ""
    ];
  return Array.isArray(relations) ? relations : [];
};
const relationsBeforeEditing = ref<unknown[]>([]);
const metadataOnRelationKey = computed<string | undefined>(() => {
  const config = props.metadata.inputField?.metadataOnRelationFieldConfig;
  return config?.enabled ? config.key : undefined;
});
// The relations as they would be stored: removed ones dropped, and the
// metadata-on-relation value present (empty when unset) on relations that
// already existed, so clearing it counts as a change.
const toScopeRelations = (
  relations: unknown[],
  existingKeys: Set<string>,
): RelationValue[] =>
  relations
    .filter(
      (relation: any) =>
        relation && relation.editStatus !== EditStatus.Deleted,
    )
    .map((relation: any) => {
      const metadata = (relation.metadata ?? [])
        .filter(Boolean)
        .map((entry: any) => ({ key: entry.key, value: entry.value }));
      const key = metadataOnRelationKey.value;
      if (
        key &&
        existingKeys.has(relation.key) &&
        !metadata.some((entry: any) => entry.key === key)
      )
        metadata.push({ key, value: "" });
      return {
        key: relation.key,
        type: relation.type ?? relationTypeOfField.value,
        ...(relation.value !== undefined ? { value: relation.value } : {}),
        metadata,
      } as RelationValue;
    });
const relationScopeInput = computed(() => {
  const existingKeys = new Set(
    relationsBeforeEditing.value.map((relation: any) => relation?.key),
  );
  return buildRelationsInput(
    toScopeRelations(relationsBeforeEditing.value, existingKeys),
    toScopeRelations(formRelations(), existingKeys),
  );
});
const relationDirty = computed<boolean>(
  () =>
    isEditingInPlace.value &&
    isRelationField.value &&
    relationScopeInput.value.relations.length > 0,
);
const restoreRelations = (relations: unknown[]) =>
  getForm(props.formId)?.resetField(relationsPath.value, {
    value: JSON.parse(JSON.stringify(relations)),
  });
const saveRelationsInline = async () => {
  const form = getForm(props.formId);
  const { valid, errors } = await validateRelations({
    relations: formRelations() as any[],
    rules: getValidationRules(true, isFieldRequired.value),
    label: fieldLabel.value,
    formValues: form?.values ?? {},
  });
  if (!valid) {
    inlineError.value = errors[0];
    return;
  }
  inlineSaving.value = true;
  inlineError.value = undefined;
  try {
    const formInput = relationScopeInput.value;
    const saved = await saveScope({
      entityId: entityFormData?.id || props.formId,
      collection: entityFormData?.collection ?? Collection.Entities,
      formInput,
    });
    const stored = (saved as any)?.relationValues?.[
      relationTypeOfField.value ?? ""
    ];
    restoreRelations(
      Array.isArray(stored)
        ? stored
        : toScopeRelations(formRelations(), new Set()),
    );
    if (saved) entityFormData?.onSaved?.(saved);
    savedAnnouncement.value = inPlaceScope.messages.saved();
    closeEditor();
    focusFieldValue();
  } catch {
    inlineError.value = inPlaceScope.messages.saveFailed();
  } finally {
    inlineSaving.value = false;
  }
};

// A click on a relation chip navigates to the related entity. A plain-text
// relation doesn't navigate, and a chip's value box (a page number) is part
// of the value, so those clicks open the editor instead.
const isRelationChipClick = (event?: Event): boolean => {
  if (event?.type !== "click" || !isRelationField.value) return false;
  const target = event.target as HTMLElement | null;
  const chip = target?.closest?.(".multiselect-tag");
  if (!chip) return false;
  if (target?.closest?.("[data-tag-input]")) {
    event.stopPropagation();
    return false;
  }
  if (props.metadata.inputField?.readOnlyValueAsPlainText) {
    event.stopPropagation();
    return false;
  }
  return true;
};

const startEditing = (event?: Event) => {
  if (!canEditInPlace.value || isEditingInPlace.value) return;
  // A link or the copy button inside the value keeps its own click.
  if (event?.type === "click" && isInnerControlClick(event, fieldValueRef.value))
    return;
  if (isRelationChipClick(event)) return;
  const opened = inPlaceScope.open({
    isDirty: () =>
      isRelationField.value ? relationDirty.value : inlineDirty.value,
    close: closeEditor,
    save: async () => {
      await saveInline(latestDraft.value);
      return !isEditingInPlace.value;
    },
    discard: () => cancelInline(),
  });
  if (!opened) return;
  if (isRelationField.value)
    relationsBeforeEditing.value = JSON.parse(JSON.stringify(formRelations()));
  valueBeforeEditing.value = fieldValueProxy.value;
  latestDraft.value = fieldValueProxy.value;
  savedAnnouncement.value = "";
  isEditingInPlace.value = true;
};
const cancelInline = () => {
  if (isRelationField.value) restoreRelations(relationsBeforeEditing.value);
  else fieldValueProxy.value = valueBeforeEditing.value;
  closeEditor();
  focusFieldValue();
};
const saveInline = async (value: unknown) => {
  if (isRelationField.value) return saveRelationsInline();
  fieldValueProxy.value = value;
  const { valid, errors } = await validateScope(async () => {
    const result = await field.validate();
    return { valid: result.valid, errors: result.errors };
  }, [fieldKey.value]);
  if (!valid) {
    inlineError.value = Object.values(errors)[0]?.[0];
    return;
  }
  inlineSaving.value = true;
  inlineError.value = undefined;
  try {
    const savedEntity = await saveScope({
      entityId: props.linkedEntityId || entityFormData?.id || props.formId,
      collection: entityFormData?.collection ?? Collection.Entities,
      formInput: buildMetadataInput(
        props.metadata.key,
        asListIfNeeded(
          toMetadataValue(value),
          !!(props.metadata.inputField as any)?.valueAsList,
        ),
      ),
    });
    field.resetField({ value: fieldValueProxy.value });
    if (savedEntity && !props.linkedEntityId)
      entityFormData?.onSaved?.(savedEntity);
    savedAnnouncement.value = inPlaceScope.messages.saved();
    closeEditor();
    focusFieldValue();
  } catch {
    inlineError.value = inPlaceScope.messages.saveFailed();
  } finally {
    inlineSaving.value = false;
  }
};
// Enter and Space open the editor only when the value itself has focus, so
// a focused link inside it (or a value that can't be edited) keeps its keys.
const onActivateKey = (event: KeyboardEvent) => {
  if (!canEditInPlace.value || event.target !== event.currentTarget) return;
  event.preventDefault();
  startEditing();
};

// The dashed underline marks editable text; chip values (dropdowns, pills)
// carry their own shape instead.
const underlineValue = computed<boolean>(
  () =>
    canEditInPlace.value &&
    !autoCompleteType.value &&
    !resolvedMetadataValue.value?.formatter,
);
</script>

<style scoped>
@layer utilities {
  .locked-field :deep(.multiselect),
  .locked-field :deep(.multiselect-wrapper) {
    background: var(--color-background-normal) !important;
    border-width: 0 !important;
  }

  .locked-field :deep(.multiselect-search) {
    background: var(--color-background-normal) !important;
  }
}
</style>
