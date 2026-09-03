<template>
  <div :class="[{ 'pl-10 py-0': parentIsListItem }, ' p-2 w-full']">
    <div
      v-if="panel.panelHeaderContent?.label"
      @click="toggleIsCollapsed()"
      class="flex items-center justify-between cursor-pointer"
    >
      <div class="flex gap-4 w-2/3 items-center">
        <h2>{{ t(panel.panelHeaderContent.label) }}</h2>
        <span
          v-if="libraryDataValue !== undefined"
          data-cy="panel-header-library-data"
          class="px-2 py-0.5 rounded-full text-sm text-text-body whitespace-nowrap"
          :class="libraryDataValue ? 'bg-accent-normal' : 'bg-neutral-30'"
        >
          {{ libraryDataLabel }}
        </span>
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

    <div
      class="grid transition-[grid-template-rows] duration-200 ease-out"
      :class="isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'"
    >
      <div class="min-h-0 overflow-hidden">
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
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watchEffect } from "vue";
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
