<template>
  <div
    ref="panelRef"
    :class="[{ 'pl-10 py-0': parentIsListItem }, ' p-2 w-full']"
  >
    <div
      v-if="panel.panelHeaderContent?.label"
      @click="toggleIsCollapsed()"
      class="flex items-center justify-between cursor-pointer"
    >
      <div class="flex gap-4 w-2/3 items-center">
        <h2>{{ t(panel.panelHeaderContent.label) }}</h2>
        <div
          v-if="panel.panelHeaderContent.libraryData"
          class="grid transition-[grid-template-columns,opacity] duration-300 ease-out"
          :class="
            libraryDataValue !== undefined
              ? 'grid-cols-[1fr] opacity-100'
              : 'grid-cols-[0fr] opacity-0'
          "
        >
          <span
            data-cy="panel-header-library-data"
            class="overflow-hidden px-2 py-0.5 rounded-full text-sm text-text-body whitespace-nowrap"
            :class="libraryDataValue ? 'bg-accent-normal' : 'bg-neutral-30'"
          >
            {{ libraryDataLabel }}
          </span>
        </div>
        <!-- The status is edited in place; its clicks (the value, the
             inline editor) stay with it instead of toggling the panel. It
             is only as wide as its value, so the rest of the header still
             toggles, and gets room again while its editor is open. -->
        <div
          v-if="panel.panelHeaderContent.panelStatus"
          data-cy="panel-header-status"
          class="w-fit max-w-[50%] min-w-0 has-[[data-cy=inline-field-editor]]:w-full"
          @click.stop
        >
          <MetadataWrapper
            :metadata="getStatusMetadata()"
            :form-id="formId"
            :isEdit="isEdit"
            :show-errors="editState.showErrors"
          />
        </div>
      </div>
      <div class="flex justify-end gap-4">
        <div v-if="repeatablePanel && isEdit">
          <base-button-new
            :label="t('Add more')"
            :icon="DamsIcons.Plus"
            button-size="sm"
            button-style="commit"
            @click.stop
            @click="
              () => {
                repeatableFieldsHelper.increaseFieldRepeatAmount();
                expandPanel();
              }
            "
          ></base-button-new>
        </div>
        <!-- Adding a row only starts it (a pill): it is saved with its first
             saved field. One unsaved row at a time; adding again goes to it. -->
        <button
          v-if="canEditRows"
          type="button"
          data-cy="repeatable-add-row"
          class="inline-flex items-center gap-(--button-gap) rounded-pill p-(--button-sm-padding) text-button-sm font-bold text-text-light hover:bg-accent-wash"
          @click.stop="addRow"
        >
          <unicon :name="Unicons.Plus.name" height="14" aria-hidden="true" />
          {{ rowMessages.add() }}
        </button>
        <unicon
          :name="
            !isCollapsed ? Unicons.CompressAlt.name : Unicons.ExpandAlt.name
          "
        />
      </div>
    </div>

    <div
      class="grid transition-[grid-template-rows] duration-200 ease-out"
      :class="isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'"
    >
      <div class="min-h-0 overflow-hidden">
        <div
          v-for="idx in repeatableFieldsHelper.repeatAmount.value"
          :key="idx + '-window-panel-content'"
        >
          <!-- A removable row is headed by its number and the remove button,
               between two rules, so the fields keep the row's full width. -->
          <div
            v-if="canEditRows && repeatableFieldsHelper.canRemoveRow(idx - 1)"
            data-cy="repeatable-row-header"
            class="flex items-center gap-2 px-2 pt-2"
          >
            <span
              aria-hidden="true"
              class="flex-1 border-t border-border-default"
            />
            <span
              data-cy="repeatable-row-label"
              class="shrink-0 whitespace-nowrap text-label font-bold text-text-secondary"
            >
              {{ rowLabel(idx) }}
            </span>
            <base-button-new
              data-cy="repeatable-remove-row"
              class="!w-max shrink-0"
              label=""
              :aria-label="`${rowMessages.remove()}: ${rowLabel(idx)}`"
              :icon="DamsIcons.Trash"
              button-size="sm"
              button-style="ghost"
              @click="removeRow(idx - 1)"
            />
            <span
              aria-hidden="true"
              class="flex-1 border-t border-border-default"
            />
          </div>
          <WindowPanelContent
            :data-repeatable-row="idx - 1"
            :relation-array="relationArray"
            :metadatafields="getMetadataFields(panel, formId, idx - 1)"
            :can-be-multiple-columns="canBeMultipleColumns"
            :form-id="formId"
            :is-edit="isEdit"
            :edit-state="editState"
            :identifiers="identifiers"
            :parent-is-list-item="parentIsListItem"
            :repeatablePanelConfig="{
              isRepeatable: repeatablePanel,
              field: repeatableFieldsHelper.fields.value[idx - 1],
              index: idx - 1,
              repeatableFieldsHelper,
            }"
            @decreaseRepeatedFieldAmount="
              repeatableFieldsHelper.decreaseFieldRepeatAmount(idx - 1)
            "
          />
          <hr
            class="my-4 border-neutral-30"
            v-if="
              !repeatableFieldsHelper.fields.value[idx - 1]?.isLast &&
              repeatablePanel &&
              !canEditRows
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, nextTick, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { Unicons } from "@/types";
import WindowPanelContent from "./WindowPanelContent.vue";
import { getMetadataFields } from "@/helpers";
import {
  canUpdateEntity,
  useInPlaceScope,
} from "@/composables/useInPlaceScope";
import { buildMetadataInput, saveScope } from "@/composables/useScopedSave";
import { useConfirmModal } from "@/composables/useConfirmModal";
import { useBaseNotification } from "@/composables/useBaseNotification";
import { useRepeatableFields } from "@/composables/useRepeatableFields";
import { useEditMode } from "@/composables/useEdit";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import {
  type WindowElementPanel,
  DamsIcons,
  type PanelRelation,
  type PanelMetaData,
  Collection,
} from "@/generated-types/queries";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import { useWindowOrPanelStatus } from "@/composables/useWindowOrPanelStatus";
import { getLibraryDataValue } from "@/components/library/useBaseLibrary";

const props = withDefaults(
  defineProps<{
    panel: WindowElementPanel;
    identifiers: string[];
    isEdit: boolean;
    formId: string;
    parentIsListItem?: boolean;
  }>(),
  { parentIsListItem: false },
);
const { t, te } = useI18n();

const editState = useEditMode(props.formId);
const isCollapsed = ref<boolean>(props.panel.isCollapsed);
const canBeMultipleColumns = ref<boolean>(
  props.panel.canBeMultipleColumns || false,
);
const repeatablePanel = ref<boolean>(!!props.panel.repetitionConfig);
const panelId = computed(() => props.panel.repetitionConfig?.repetitionKey);
const repeatableFieldsHelper = useRepeatableFields(
  panelId.value!,
  props.formId,
);
const { getStatusMetadata, registerEditableKey } = useWindowOrPanelStatus(
  computed(() => props.panel.panelHeaderContent?.panelStatus),
  props.formId,
  computed(() => props.isEdit),
);

const libraryDataValue = computed(() =>
  getLibraryDataValue(props.panel.panelHeaderContent?.libraryData),
);
const libraryDataLabel = computed(() => {
  const libraryData = props.panel.panelHeaderContent?.libraryData;
  if (!libraryData?.label) return String(libraryDataValue.value);
  return t(libraryData.label, {
    [libraryData.dataKey]: libraryDataValue.value,
    count: libraryDataValue.value,
  });
});

const toggleIsCollapsed = () => {
  isCollapsed.value = !isCollapsed.value;
};

const relationArray = computed((): PanelRelation[] =>
  Object.values(props.panel).flatMap((value) =>
    Array.isArray(value)
      ? value.filter((item) => item?.__typename === "PanelRelation")
      : [],
  ),
);

const expandPanel = () => {
  isCollapsed.value = false;
};

// --- Rows of a repeatable panel, added and removed in place ----------------
const entityFormData = inject<
  | {
      id?: string;
      collection?: Collection;
      onSaved?: (savedEntity: unknown) => void;
    }
  | undefined
>("entityFormData", undefined);
const { confirm } = useConfirmModal();
const { displayErrorNotification } = useBaseNotification();
// Removing shifts the rows, so it takes the edit scope like an editor does.
const removeRowScope = useInPlaceScope(
  () => `${props.formId}:${panelId.value}:remove-row`,
);
const translated = (key: string, fallback: string): string =>
  te(key) ? t(key) : fallback;
const rowMessages = {
  // The same label as the page-edit button.
  add: () => t("Add more"),
  remove: () => translated("inline-edit.remove-row", "Remove row"),
};
const rowLabel = (rowNumber: number): string =>
  `${t(props.panel.panelHeaderContent?.label ?? "")} ${rowNumber}`.trim();
const canEditRows = computed<boolean>(
  () =>
    repeatablePanel.value &&
    !props.isEdit &&
    props.panel.isEditable !== false &&
    canUpdateEntity(editState) &&
    getMetadataFields(props.panel, props.formId).some(
      (field) => !!(field as PanelMetaData).inputField,
    ),
);
const panelRef = ref<HTMLElement | null>(null);
// The row's first field gets the focus; it opens when it is clicked.
const addRow = async () => {
  const index = repeatableFieldsHelper.addRow();
  expandPanel();
  await nextTick();
  panelRef.value
    ?.querySelector<HTMLElement>(
      `[data-repeatable-row="${index}"] [data-cy="field-value"][role="button"]`,
    )
    ?.focus();
};
const removeRow = async (index: number) => {
  if (!repeatableFieldsHelper.isStoredRow(index))
    return repeatableFieldsHelper.discardUnsavedRow(index);
  if (!removeRowScope.open({ isDirty: () => false })) return;
  try {
    const choice = await confirm({
      title: translated(
        "inline-edit.remove-row-confirm.title",
        "Remove this row?",
      ),
      message: translated(
        "inline-edit.remove-row-confirm.message",
        "Its values are deleted when you confirm.",
      ),
      confirmLabel: translated(
        "inline-edit.remove-row-confirm.confirm",
        "Remove",
      ),
      cancelLabel: translated(
        "inline-edit.remove-row-confirm.cancel",
        "Cancel",
      ),
      confirmButtonStyle: "danger",
    });
    if (choice !== "confirm") return;
    const rows = repeatableFieldsHelper.rowsWithout(index);
    const savedEntity = await saveScope({
      entityId: entityFormData?.id || props.formId,
      collection: entityFormData?.collection ?? Collection.Entities,
      formInput: buildMetadataInput(repeatableFieldsHelper.fieldKey, rows),
    });
    repeatableFieldsHelper.removeSavedRow(index, rows);
    if (savedEntity) entityFormData?.onSaved?.(savedEntity);
  } catch {
    displayErrorNotification(removeRowScope.messages.saveFailed(), "");
  } finally {
    removeRowScope.release();
  }
};

watchEffect(() => {
  if (repeatablePanel.value) {
    repeatableFieldsHelper.init();
  }
  registerEditableKey();
});
</script>
