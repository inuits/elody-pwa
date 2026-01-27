<template>
  <div :class="[{ 'pl-10 py-0': parentIsListItem }, ' p-2 w-full']">
    <div
      v-if="panel.label"
      @click="toggleIsCollapsed()"
      class="flex items-center justify-between cursor-pointer"
    >
      <h2>{{ t(panel.label) }}</h2>
      <div class="flex justify-end gap-4">
        <div v-if="repeatablePanel && isEdit">
          <base-button-new
            :label="t('Add more')"
            :icon="DamsIcons.Plus"
            button-size="small"
            button-style="accentAccent"
            @click.stop
            @click="
              () => {
                repeatableFieldsHelper.increaseFieldRepeatAmount('hoi');
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
          v-for="idx in panelRepetitions"
          :key="idx + '-window-panel-content'"
        >
          <WindowPanelContent
            :panel-type="panelType"
            :relation-array="relationArray"
            :metadatafields="baseMetadataFields"
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
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { computed, onUnmounted, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { Unicons } from "@/types";
import WindowPanelContent from "./WindowPanelContent.vue";
import { getMetadataFields } from "@/helpers";
import { useRepeatableFields } from "@/composables/useRepeatableFields";
import { useEditMode } from "@/composables/useEdit";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import {
  type WindowElementPanel,
  type PanelType,
  DamsIcons,
  type PanelRelation,
} from "@/generated-types/queries";
import { nanoid } from "nanoid";

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
const repeatablePanel = ref<boolean>(
  props.panel.repetitionConfig?.repeatable ?? false,
);
const panelId = computed(
  () => props.panel.repetitionConfig?.repetitionKey || nanoid(),
);
const repeatableFieldsHelper = useRepeatableFields(panelId.value);
const panelRepetitions = computed(
  () => repeatableFieldsHelper.repeatAmount.value,
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

const baseMetadataFields = computed(() => {
  return getMetadataFields(props.panel, panelType.value, props.formId);
});

const expandPanel = () => {
  isCollapsed.value = false;
};

watchEffect(() => {
  if (repeatablePanel.value) {
    console.log("Here :)");
    repeatableFieldsHelper.init();
  }
});
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
