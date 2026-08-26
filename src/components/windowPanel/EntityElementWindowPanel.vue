<template>
  <div :class="[{ 'pl-10 py-0': parentIsListItem }, ' p-2 w-full']">
    <div
      v-if="panel.panelHeaderContent?.label"
      @click="toggleIsCollapsed()"
      class="flex items-center justify-between cursor-pointer"
    >
      <div class="flex gap-4 w-2/3 items-center">
        <h2>{{ t(panel.panelHeaderContent.label) }}</h2>
        <MetadataWrapper
          class="w-full max-w-[50%]"
          v-if="panel.panelHeaderContent.panelStatus"
          :metadata="getStatusMetadata()"
          :form-id="formId"
          :isEdit="isEdit"
          :show-errors="editState.showErrors"
        />
      </div>
      <div class="flex justify-end gap-4">
        <div v-if="repeatablePanel && isEdit">
          <base-button
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
          ></base-button>
        </div>
        <button
          type="button"
          class="window-panel__toggle"
          :aria-expanded="!isCollapsed"
          :aria-label="t(isCollapsed ? 'tree.expand' : 'tree.collapse')"
          @click.stop="toggleIsCollapsed()"
        >
          <unicon
            :name="
              !isCollapsed ? Unicons.CompressAlt.name : Unicons.ExpandAlt.name
            "
          />
        </button>
      </div>
    </div>

    <transition>
      <div
        v-show="!isCollapsed"
        :class="{
          'field-group': isGroup,
          'field-group--editing': isGroup && group.isEditing.value,
        }"
        :role="isGroup ? 'group' : undefined"
        @keydown.escape="isGroup && fieldEditor.cancel()"
      >
        <div
          v-for="idx in repeatableFieldsHelper.repeatAmount.value"
          :key="idx + '-window-panel-content'"
        >
          <WindowPanelContent
            :panel-type="panelType"
            :relation-array="relationArray"
            :metadatafields="
              getMetadataFields(panel, panelType, formId, idx - 1)
            "
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
              repeatablePanel
            "
          />
        </div>

        <!-- One Bewaar/Annuleer for the whole group, never one per field
             (group-form-card.md). -->
        <div v-if="isGroup && group.isEditing.value" class="field-group__actions">
          <p
            v-if="fieldEditor.errorMessage.value"
            role="alert"
            class="field-group__error"
          >
            {{ t("group-form.check-highlighted-fields") }}
          </p>
          <BaseButton
            button-style="commit"
            button-size="sm"
            :label="t('inline-editor.save')"
            :disabled="!group.isDirty.value || group.isSaving.value"
            :loading="group.isSaving.value"
            data-cy="field-group-save"
            @click="fieldEditor.save()"
          />
          <BaseButton
            button-style="ghost"
            button-size="sm"
            :label="t('inline-editor.cancel')"
            :disabled="group.isSaving.value"
            data-cy="field-group-cancel"
            @click="fieldEditor.cancel()"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, provide, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { Unicons } from "@/types";
import WindowPanelContent from "./WindowPanelContent.vue";
import { getMetadataFields } from "@/helpers";
import { useRepeatableFields } from "@/composables/useRepeatableFields";
import { useEditMode } from "@/composables/useEdit";
import BaseButton from "@/components/base/BaseButton.vue";
import {
  type WindowElementPanel,
  type PanelType,
  DamsIcons,
  type PanelRelation,
} from "@/generated-types/queries";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import { useWindowOrPanelStatus } from "@/composables/useWindowOrPanelStatus";
import { useBlockEditor } from "@/composables/useBlockEditor";
import { useFieldEditor } from "@/composables/useFieldEditor";

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
const { t } = useI18n();

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
/* Fields that make no sense apart edit as one group; every other panel keeps
   its rows independent. The flag is opt-in from the form definition. */
const isGroup = computed<boolean>(() => Boolean((props.panel as any).isGroup));
const persistEntity = inject<(() => Promise<void>) | undefined>(
  "persistEntity",
  undefined,
);
const fieldEditor = useFieldEditor();
const group = useBlockEditor(`${props.formId}:panel:${props.panel.metaData?.key ?? panelId.value ?? "group"}`, async () => {
  await persistEntity?.();
});

// Only a real group publishes itself; without this every row would look for a
// group that has no card and no actions to commit through.
if (isGroup.value) provide("fieldGroup", group);

const { getStatusMetadata, registerEditableKey } = useWindowOrPanelStatus(
  computed(() => props.panel.panelHeaderContent?.panelStatus),
  props.formId,
  computed(() => props.isEdit),
);

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
</script>

<style scoped>
.window-panel__toggle {
  display: flex;
  align-items: center;
  padding: var(--spacing-ds-1);
  border-radius: var(--radius-chip);
  cursor: pointer;
}

.window-panel__toggle:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}

/* Resting, the group's rows carry a tint to signal that they belong together;
   editing, the whole group lifts into a card (group-form-card.md). */
.field-group {
  background-color: var(--color-surface-group-tint);
  border-radius: var(--radius-card);
  padding: var(--spacing-ds-6);
  transition:
    background-color var(--transition-duration-ui) var(--ease-ui),
    border-color var(--transition-duration-ui) var(--ease-ui);
  border: 1px solid transparent;
}

.field-group--editing {
  background-color: var(--color-surface-group-form);
  border-color: var(--color-border-default);
}

.field-group__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--spacing-ds-5);
  margin-top: var(--spacing-ds-6);
}

.field-group__actions > :deep(.ds-button) {
  flex: none;
  width: auto;
}

.field-group__error {
  margin-right: auto;
  font-size: var(--text-hint);
  color: var(--color-danger);
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
