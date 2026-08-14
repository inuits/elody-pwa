<template>
  <div
    ref="panelRoot"
    :class="[{ 'pl-10 py-0': parentIsListItem }, ' p-2 w-full']"
  >
    <div
      v-if="panel.panelHeaderContent?.label"
      @click="toggleIsCollapsed()"
      class="flex items-center justify-between cursor-pointer"
    >
      <div class="flex gap-4 w-2/3 items-center">
        <h2 class="text-sm font-bold text-text-body">
          {{ t(panel.panelHeaderContent.label) }}
        </h2>
        <span
          v-if="savedFlash"
          data-cy="block-edit-saved"
          class="flex items-center text-green-600"
        >
          <unicon :name="Unicons.Check.name" height="14" />
        </span>
        <MetadataWrapper
          class="w-full max-w-[50%]"
          v-if="panel.panelHeaderContent.panelStatus"
          :metadata="getStatusMetadata()"
          :form-id="formId"
          :isEdit="isEdit"
        />
      </div>
      <div class="flex justify-end gap-4 items-center">
        <!-- no "Edit block" button: clicking any field of an interdependent
             group opens the whole group form in place (one gesture) -->
        <div v-if="repeatablePanel && isEdit">
          <base-button-new
            :label="t('Add more')"
            :icon="DamsIcons.Plus"
            button-size="small"
            button-style="accentAccent"
            @click.stop
            @click="
              () => {
                repeatableFieldsHelper.increaseFieldRepeatAmount();
                expandPanel();
              }
            "
          ></base-button-new>
        </div>
        <unicon
          :name="
            !isCollapsed ? Unicons.CompressAlt.name : Unicons.ExpandAlt.name
          "
        />
      </div>
    </div>

    <transition>
      <div
        v-show="!isCollapsed"
        :role="panelIsEditing ? 'group' : undefined"
        :aria-label="
          panelIsEditing && panel.panelHeaderContent?.label
            ? t(panel.panelHeaderContent.label)
            : undefined
        "
        :class="{
          'interdependent-fields': isInterdependent && !panelIsEditing,
          'rounded-lg border border-accent-light-strong bg-surface-group-form p-2 my-1':
            panelIsEditing,
        }"
        @keydown.esc.stop.prevent="panelIsEditing || editingRowIndex !== null ? cancelRowOrBlock() : undefined"
      >
        <div
          v-for="idx in repeatableFieldsHelper.repeatAmount.value"
          :key="idx + '-window-panel-content'"
          :class="{
            'rounded-lg border border-accent-light-strong bg-surface-group-form my-1':
              rowIsEditing(idx - 1),
            'rounded-md bg-surface-repeat-row':
              repeatablePanel && !rowIsEditing(idx - 1) && (idx - 1) % 2 === 1,
            'rounded-md hover:bg-surface-row-hover':
              repeatablePanel && !rowIsEditing(idx - 1) && !panelIsEditing,
          }"
        >
          <WindowPanelContent
            :class="{
              'pointer-events-none opacity-60':
                isSaving && (panelIsEditing || rowIsEditing(idx - 1)),
            }"
            :panel-type="panelType"
            :relation-array="relationArray"
            :metadatafields="
              getMetadataFields(panel, panelType, formId, idx - 1)
            "
            :can-be-multiple-columns="canBeMultipleColumns"
            :form-id="formId"
            :is-edit="isEdit || rowIsEditing(idx - 1) || panelIsEditing"
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
          <!-- per-row controls: the row is the edit/save/validation unit -->
          <div
            v-if="repeatablePanel && !isEdit"
            class="flex items-center gap-2 px-2 pb-2"
            @click.stop
          >
            <template v-if="rowIsEditing(idx - 1)">
              <template v-if="!isSaving">
                <span class="mr-auto text-xs text-text-placeholder">
                  {{
                    translate(
                      "block-edit.row-note",
                      "Writes the whole row in one mutation.",
                    )
                  }}
                </span>
                <button
                  type="button"
                  data-cy="row-edit-cancel"
                  class="rounded-md bg-transparent px-3 py-1 text-xs font-bold text-text-light cursor-pointer hover:bg-accent-wash focus-visible:outline-2 focus-visible:outline-accent-accent"
                  @click="cancelRowOrBlock"
                >
                  {{ translate("block-edit.cancel", "Cancel") }}
                </button>
                <button
                  type="button"
                  data-cy="row-edit-save"
                  class="rounded-md bg-accent-accent px-3 py-1 text-xs font-bold text-neutral-white cursor-pointer hover:bg-commit-hover focus-visible:outline-2 focus-visible:outline-accent-accent"
                  @click="saveRow"
                >
                  {{ translate("block-edit.save-row", "Save row") }}
                </button>
              </template>
              <SpinnerLoader v-else theme="accent" :dimensions="4" />
              <span
                v-if="blockError"
                role="alert"
                data-cy="block-edit-error"
                class="text-xs font-bold text-red-default"
              >
                {{ blockError }}
              </span>
            </template>
            <template v-else-if="editingRowIndex === null && !panelIsEditing">
              <button
                type="button"
                data-cy="row-edit-button"
                class="rounded-md border border-neutral-40 bg-neutral-white px-2.5 py-0.5 text-xs font-bold text-text-body cursor-pointer hover:bg-accent-light hover:border-accent-accent focus-visible:outline-2 focus-visible:outline-accent-accent"
                @click="startRowEdit(idx - 1)"
              >
                {{ translate("block-edit.edit-row", "Edit row") }}
              </button>
              <button
                type="button"
                data-cy="row-delete-button"
                :aria-label="translate('block-edit.delete-row', 'Delete row')"
                class="flex items-center rounded-md border border-neutral-40 bg-neutral-white px-1.5 py-1 text-text-placeholder cursor-pointer hover:bg-red-light hover:text-red-default focus-visible:outline-2 focus-visible:outline-accent-accent"
                @click="deleteRow(idx - 1)"
              >
                <unicon :name="Unicons.Trash.name" height="12" />
              </button>
            </template>
          </div>
          <hr
            class="my-4 border-neutral-30"
            v-if="
              !repeatableFieldsHelper.fields.value[idx - 1]?.isLast &&
              repeatablePanel
            "
          />
        </div>
        <div
          v-if="
            repeatablePanel &&
            !isEdit &&
            editingRowIndex === null &&
            canBlockEditRows
          "
          class="flex items-center gap-2"
        >
          <button
            type="button"
            data-cy="row-add-button"
            class="mt-1 rounded-pill border border-dashed border-border-dashed bg-transparent px-3 py-0.5 text-label font-bold text-text-light cursor-pointer hover:border-accent-accent hover:text-accent-accent focus-visible:outline-2 focus-visible:outline-accent-accent"
            @click.stop="addRow"
          >
            + {{ addRowLabel }}
          </button>
          <span
            v-if="repeatableFieldsHelper.repeatAmount.value === 0"
            class="mt-1 text-xs text-text-placeholder opacity-45"
          >
            {{ translate("block-edit.empty-hint", "No rows yet") }}
          </span>
        </div>
        <!-- block form footer: one save for the whole block -->
        <div
          v-if="panelIsEditing"
          class="flex items-center gap-2 px-2 pb-2 pt-1"
          @click.stop
        >
          <template v-if="!isSaving">
            <span class="mr-auto text-xs text-text-placeholder">
              {{
                isInterdependent
                  ? translate(
                      "block-edit.group-note",
                      "These fields belong together and save as one.",
                    )
                  : translate(
                      "block-edit.block-note",
                      "Saves the whole block in one mutation.",
                    )
              }}
            </span>
            <button
              type="button"
              data-cy="block-edit-cancel"
              class="rounded-md bg-transparent px-3.5 py-1 text-xs font-bold text-text-light cursor-pointer hover:bg-accent-wash focus-visible:outline-2 focus-visible:outline-accent-accent"
              @click="cancelRowOrBlock"
            >
              {{ translate("block-edit.cancel", "Cancel") }}
            </button>
            <button
              type="button"
              data-cy="block-edit-save"
              class="rounded-md bg-accent-accent px-3.5 py-1 text-xs font-bold text-neutral-white cursor-pointer hover:bg-commit-hover focus-visible:outline-2 focus-visible:outline-accent-accent"
              @click="saveBlock"
            >
              {{ translate("block-edit.save-block", "Save block") }}
            </button>
          </template>
          <SpinnerLoader v-else theme="accent" :dimensions="4" />
          <span
            v-if="blockError"
            role="alert"
            data-cy="block-edit-error"
            class="text-xs font-bold text-red-default"
          >
            {{ blockError }}
          </span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onUnmounted, provide, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import EventBus from "@/EventBus";
import { Unicons } from "@/types";
import WindowPanelContent from "./WindowPanelContent.vue";
import { getMetadataFields } from "@/helpers";
import { useRepeatableFields } from "@/composables/useRepeatableFields";
import { useEditMode } from "@/composables/useEdit";
import { useBlockEditor } from "@/composables/useBlockEditor";
import { useUndo } from "@/composables/useUndo";
import { deepToRaw } from "@/utils/deepToRaw";
import { useVeeValidate } from "@/components/metadata/useVeeValidate";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import { auth } from "@/main";
import {
  type WindowElementPanel,
  type PanelType,
  DamsIcons,
  type PanelRelation,
  type PanelMetaData,
} from "@/generated-types/queries";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import { useWindowOrPanelStatus } from "@/composables/useWindowOrPanelStatus";

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

const translate = (key: string, fallback: string): string =>
  te(key) ? t(key) : fallback;

const editState = useEditMode(props.formId);
const panelType = ref<PanelType>(props.panel.panelType);
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

const { getVeeValidateKey } = useVeeValidate();
const { displayUndoNotification } = useUndo();
const {
  isEditingBlock,
  isSaving,
  blockError,
  savedFlash,
  start,
  cancel,
  save,
} = useBlockEditor(props.formId);

const editingRowIndex = ref<number | null>(null);
const panelIsEditing = computed(
  () => isEditingBlock.value && editingRowIndex.value === null,
);
const rowIsEditing = (index: number) =>
  isEditingBlock.value && editingRowIndex.value === index;

const editableFields = computed<PanelMetaData[]>(() =>
  Object.values(props.panel).filter(
    (value: any): value is PanelMetaData =>
      value &&
      typeof value === "object" &&
      value.__typename === "PanelMetaData" &&
      value.inputField &&
      !value.nonEditableField,
  ),
);

const canBlockEditRows = computed<boolean>(
  () => auth.isAuthenticated.value === true && editableFields.value.length > 0,
);

// One gesture, system-chosen scope: a panel is an interdependent group when
// its fields carry cross-field rules (required_if/available_if) or when it
// mixes relation members with property members (they must commit together).
// Clicking any field of such a panel opens the whole group form in place —
// there is no "Edit block" button.
const isInterdependent = computed<boolean>(() => {
  if (repeatablePanel.value || props.parentIsListItem) return false;
  const fields = editableFields.value;
  if (fields.length < 2) return false;
  const hasCrossFieldRule = fields.some(
    (field: any) =>
      field.inputField?.validation?.required_if ||
      field.inputField?.validation?.available_if,
  );
  const hasRelationMember = fields.some(
    (field: any) =>
      field.inputField?.relationType && !field.inputField?.isMetadataField,
  );
  const hasPropertyMember = fields.some(
    (field: any) =>
      !field.inputField?.relationType || field.inputField?.isMetadataField,
  );
  return hasCrossFieldRule || (hasRelationMember && hasPropertyMember);
});

const openGroupFromField = (fieldKey?: string) => {
  if (props.isEdit || isEditingBlock.value) return;
  startBlockEdit();
  nextTick(() => {
    const scope = panelRoot.value;
    if (!scope) return;
    const selector = fieldKey
      ? `[data-field-key="${CSS.escape(fieldKey)}"] input, [data-field-key="${CSS.escape(fieldKey)}"] select, [data-field-key="${CSS.escape(fieldKey)}"] textarea`
      : "input, select, textarea";
    const el = scope.querySelector<HTMLElement>(selector);
    el?.focus();
    if (el instanceof HTMLInputElement) el.select();
  });
};

provide("interdependentGroup", {
  isInterdependent,
  open: openGroupFromField,
});

const blockFieldPaths = (rowIndex?: number): string[] =>
  editableFields.value.map((field) =>
    getVeeValidateKey({
      metadata: field,
      isEdit: true,
      repeatablePanelConfig:
        rowIndex === undefined
          ? undefined
          : ({
              isRepeatable: true,
              index: rowIndex,
              repeatableFieldsHelper,
            } as any),
    }),
  );

// "+ Voeg {type} toe" when the panel carries a label; generic otherwise.
const addRowLabel = computed<string>(() => {
  const panelLabel = props.panel.panelHeaderContent?.label;
  if (panelLabel && te("block-edit.add-typed"))
    return t("block-edit.add-typed", { type: t(panelLabel) });
  return translate("block-edit.add-row", "Add row");
});

const startBlockEdit = () => {
  isCollapsed.value = false;
  editingRowIndex.value = null;
  start();
};

const startRowEdit = (index: number) => {
  isCollapsed.value = false;
  editingRowIndex.value = index;
  start();
};

const addRow = () => {
  isCollapsed.value = false;
  start();
  repeatableFieldsHelper.increaseFieldRepeatAmount();
  editingRowIndex.value = repeatableFieldsHelper.repeatAmount.value - 1;
};

const cancelRowOrBlock = () => {
  cancel();
  editingRowIndex.value = null;
};

const saveCopy = () => ({
  validationSummary: translate(
    "block-edit.check-fields",
    "Check the marked fields",
  ),
  failureCopy: translate("inline-edit.save-failed", "Saving failed, try again"),
});

const saveBlock = async () => {
  const saved = await save(
    editableFields.value,
    blockFieldPaths(),
    undefined,
    saveCopy(),
  );
  if (saved) editingRowIndex.value = null;
};

const saveRow = async () => {
  const saved = await save(
    editableFields.value,
    blockFieldPaths(editingRowIndex.value ?? 0),
    panelId.value,
    saveCopy(),
  );
  if (saved) editingRowIndex.value = null;
};

// Removal executes immediately; the undo toast restores the row with a
// compensating write (undo-over-confirm).
const deleteRow = async (index: number) => {
  const removedRow = structuredClone(
    deepToRaw(repeatableFieldsHelper.fields.value[index]?.value ?? {}),
  );
  start();
  repeatableFieldsHelper.decreaseFieldRepeatAmount(index);
  const saved = await save(editableFields.value, [], panelId.value, saveCopy());
  editingRowIndex.value = null;
  if (saved)
    displayUndoNotification(
      translate("block-edit.row-removed", "Row removed"),
      "",
      async () => {
        start();
        repeatableFieldsHelper.insertFieldAtIndex(index, removedRow);
        await save(editableFields.value, [], panelId.value, saveCopy());
      },
    );
};

const toggleIsCollapsed = () => {
  isCollapsed.value = !isCollapsed.value;
};

const relationArray = computed((): PanelRelation[] => {
  let returnArray: PanelRelation[] = [];

  Object.values(props.panel).forEach((value) => {
    if (typeof value === "object") {
      const relationList = value as [PanelRelation];

      try {
        if (!relationList.length) {
          throw Error("Value can not be spread");
        }

        returnArray.push(...relationList);
      } catch {
        returnArray = relationList;
      }
    }
  });

  return returnArray;
});

const expandPanel = () => {
  isCollapsed.value = false;
};

watchEffect(() => {
  if (repeatablePanel.value) {
    repeatableFieldsHelper.init();
  }
  registerEditableKey();
});

// Quality-status popover jumps: expand + scroll when this panel owns the key.
const panelRoot = ref<HTMLElement | null>(null);
const onJumpToField = (fieldKey: unknown) => {
  if (!editableFields.value.some((field) => field.key === fieldKey)) return;
  isCollapsed.value = false;
  nextTick(() =>
    panelRoot.value?.scrollIntoView({ block: "center", behavior: "smooth" }),
  );
};
EventBus.on("jumpToPanelField", onJumpToField);
onUnmounted(() => EventBus.off("jumpToPanelField", onJumpToField));
</script>

<style scoped>
/* group cue before the click: hovering or focusing any field of an
   interdependent group tints all fields of the group, so the scope the
   click will produce is visible in advance */
.interdependent-fields:has([data-cy="metadata-wrapper"] [role="button"]:hover)
  :deep([data-cy="metadata-wrapper"]),
.interdependent-fields:has(
    [data-cy="metadata-wrapper"] [role="button"]:focus-visible
  )
  :deep([data-cy="metadata-wrapper"]) {
  background-color: color-mix(
    in srgb,
    var(--color-accent-light) 45%,
    transparent
  );
  border-radius: 6px;
}

.v-enter-active,
.v-leave-active {
  transition: transform 0.1s linear;

  transform-origin: top;
}

.v-enter-from,
.v-leave-to {
  transform: scaleY(0%);

  transform-origin: top;
}
</style>
