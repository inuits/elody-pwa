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
          :is-edit="false"
        />
      </div>
      <div class="flex justify-end gap-4">
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
        >
          <EntityHistoryWindowPanelContent
            :panel-type="panelType"
            :relation-array="relationArray"
            :metadatafields="
              getMetadataFields(panel, panelType, formId, idx - 1)
            "
            :can-be-multiple-columns="canBeMultipleColumns"
            :form-id="formId"
            :identifiers="identifiers"
            :parent-is-list-item="parentIsListItem"
            :wysiwyg-diffs="wysiwygDiffs"
            :relation-diffs="relationDiffs"
            :repeatablePanelConfig="{
              isRepeatable: repeatablePanel,
              field: repeatableFieldsHelper.fields.value[idx - 1],
              index: idx - 1,
              repeatableFieldsHelper,
            }"
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
import { computed, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { Unicons } from "@/types";
import EntityHistoryWindowPanelContent from "@/components/history/EntityHistoryWindowPanelContent.vue";
import { getMetadataFields } from "@/helpers";
import { useRepeatableFields } from "@/composables/useRepeatableFields";
import {
  type WindowElementPanel,
  type PanelType,
  type PanelRelation,
} from "@/generated-types/queries";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import { useWindowOrPanelStatus } from "@/composables/useWindowOrPanelStatus";
import type {
  RelationDiff,
  WysiwygDiff,
} from "@/composables/useHistoryComparisonData";

const props = withDefaults(
  defineProps<{
    panel: WindowElementPanel;
    identifiers: string[];
    formId: string;
    parentIsListItem?: boolean;
    wysiwygDiffs: WysiwygDiff[];
    relationDiffs: RelationDiff[];
  }>(),
  { parentIsListItem: false },
);
const { t } = useI18n();

const panelType = ref<PanelType>(props.panel.panelType);
const isCollapsed = ref<boolean>(false);
const canBeMultipleColumns = ref<boolean>(
  props.panel.canBeMultipleColumns || false,
);
const repeatablePanel = ref<boolean>(!!props.panel.repetitionConfig);
const panelId = computed(() => props.panel.repetitionConfig?.repetitionKey);
const repeatableFieldsHelper = useRepeatableFields(
  panelId.value!,
  props.formId,
);
const { getStatusMetadata } = useWindowOrPanelStatus(
  computed(() => props.panel.panelHeaderContent?.panelStatus),
  props.formId,
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

watchEffect(() => {
  if (repeatablePanel.value) {
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
