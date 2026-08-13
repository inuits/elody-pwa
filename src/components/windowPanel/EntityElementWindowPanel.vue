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
        <button
          v-if="canBlockEdit"
          type="button"
          data-cy="block-edit-button"
          :aria-label="`${translate('block-edit.edit-block', 'Edit block')} ${t(
            panel.panelHeaderContent.label,
          )}`"
          class="flex items-center gap-1.5 rounded-md border border-neutral-40 bg-neutral-white px-2.5 py-0.5 text-xs font-bold text-text-light whitespace-nowrap cursor-pointer hover:bg-accent-light hover:border-accent-accent focus-visible:outline-2 focus-visible:outline-accent-accent"
          @click.stop="startBlockEdit"
        >
          <unicon :name="Unicons.Edit.name" height="12" />
          {{ translate("block-edit.edit-block", "Edit block") }}
        </button>
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
      <div v-show="!isCollapsed">
        <div
          v-for="idx in repeatableFieldsHelper.repeatAmount.value"
          :key="idx + '-window-panel-content'"
          :class="{
            'rounded-lg border border-accent-light bg-neutral-lightest my-1':
              rowIsEditing(idx - 1),
          }"
        >
          <WindowPanelContent
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
                <button
                  type="button"
                  data-cy="row-edit-save"
                  class="rounded-md bg-accent-accent px-3 py-1 text-xs font-bold text-neutral-white cursor-pointer hover:bg-accent-normal focus-visible:outline-2 focus-visible:outline-accent-accent"
                  @click="saveRow"
                >
                  {{ translate("block-edit.save-row", "Save row") }}
                </button>
                <button
                  type="button"
                  data-cy="row-edit-cancel"
                  class="rounded-md border border-neutral-40 bg-neutral-white px-3 py-1 text-xs font-bold text-text-body cursor-pointer hover:bg-neutral-20 focus-visible:outline-2 focus-visible:outline-accent-accent"
                  @click="cancelRowOrBlock"
                >
                  {{ translate("block-edit.cancel", "Cancel") }}
                </button>
                <span class="text-xs text-text-placeholder">
                  {{
                    translate(
                      "block-edit.row-note",
                      "Writes the whole row in one mutation.",
                    )
                  }}
                </span>
              </template>
              <SpinnerLoader v-else theme="accent" :dimensions="16" />
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
        <button
          v-if="
            repeatablePanel &&
            !isEdit &&
            editingRowIndex === null &&
            canBlockEditRows
          "
          type="button"
          data-cy="row-add-button"
          class="mt-1 rounded-md border border-dashed border-neutral-60 bg-transparent px-2.5 py-0.5 text-xs font-bold text-neutral-200 cursor-pointer hover:border-accent-accent hover:text-accent-accent focus-visible:outline-2 focus-visible:outline-accent-accent"
          @click.stop="addRow"
        >
          + {{ translate("block-edit.add-row", "Add row") }}
        </button>
        <!-- block form footer: one save for the whole block -->
        <div
          v-if="panelIsEditing"
          class="flex items-center gap-2 px-2 pb-2 pt-1"
          @click.stop
        >
          <template v-if="!isSaving">
            <button
              type="button"
              data-cy="block-edit-save"
              class="rounded-md bg-accent-accent px-3.5 py-1 text-sm font-bold text-neutral-white cursor-pointer hover:bg-accent-normal focus-visible:outline-2 focus-visible:outline-accent-accent"
              @click="saveBlock"
            >
              {{ translate("block-edit.save-block", "Save block") }}
            </button>
            <button
              type="button"
              data-cy="block-edit-cancel"
              class="rounded-md border border-neutral-40 bg-neutral-white px-3.5 py-1 text-sm font-bold text-text-body cursor-pointer hover:bg-neutral-20 focus-visible:outline-2 focus-visible:outline-accent-accent"
              @click="cancelRowOrBlock"
            >
              {{ translate("block-edit.cancel", "Cancel") }}
            </button>
            <span class="text-xs text-text-placeholder">
              {{
                translate(
                  "block-edit.block-note",
                  "Saves the whole block in one mutation.",
                )
              }}
            </span>
          </template>
          <SpinnerLoader v-else theme="accent" :dimensions="16" />
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
import { computed, nextTick, onUnmounted, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import EventBus from "@/EventBus";
import { Unicons } from "@/types";
import WindowPanelContent from "./WindowPanelContent.vue";
import { getMetadataFields } from "@/helpers";
import { useRepeatableFields } from "@/composables/useRepeatableFields";
import { useEditMode } from "@/composables/useEdit";
import { useBlockEditor } from "@/composables/useBlockEditor";
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

const canBlockEdit = computed<boolean>(
  () =>
    !props.isEdit &&
    !repeatablePanel.value &&
    !isEditingBlock.value &&
    !props.parentIsListItem &&
    canBlockEditRows.value,
);

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

const saveBlock = async () => {
  const saved = await save(editableFields.value, blockFieldPaths());
  if (saved) editingRowIndex.value = null;
};

const saveRow = async () => {
  const saved = await save(
    editableFields.value,
    blockFieldPaths(editingRowIndex.value ?? 0),
    panelId.value,
  );
  if (saved) editingRowIndex.value = null;
};

const deleteRow = async (index: number) => {
  start();
  repeatableFieldsHelper.decreaseFieldRepeatAmount(index);
  await save(editableFields.value, [], panelId.value);
  editingRowIndex.value = null;
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
