<template>
  <div data-cy="entity-element-window" class="h-full flex flex-1">
    <base-expand-button
      v-if="
        element.expandButtonOptions?.shown &&
        element.expandButtonOptions?.orientation === Orientations.Left
      "
      :orientation="element.expandButtonOptions.orientation"
      v-on:expand-media-list="resizeColumn"
    />
    <div
      class="h-full w-full border-solid border-neutral-30 border-2 bg-neutral-0 rounded-t-md"
    >
      <div
        class="border-solid border-neutral-30 border-b-2 rounded-t-md flex flex-row"
      >
        <h1
          data-cy="entity-element-window-title"
          class="subtitle text-text-body p-2"
        >
          {{ t(element.label) }}
        </h1>
        <MetadataEditButton
          class="my-2"
          v-if="
            auth.isAuthenticated.value === true &&
            element.editMetadataButton?.hasButton
          "
          button-size="small"
          :readmode-label="element.editMetadataButton.readmodeLabel"
          :editmode-label="element.editMetadataButton.editmodeLabel"
        />
      </div>
      <div v-for="(panel, index) in panels" :key="index">
        <entity-element-window-panel
          :panel="panel"
          :identifiers="identifiers"
          :is-edit="computedIsEdit"
          :form-id="formId"
        />
      </div>
    </div>
    <base-expand-button
      v-if="
        element.expandButtonOptions?.shown &&
        element.expandButtonOptions?.orientation === Orientations.Right
      "
      :orientation="element.expandButtonOptions.orientation"
      v-on:expand-media-list="resizeColumn"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  ColumnSizes,
  type WindowElement,
  type WindowElementPanel,
  Orientations,
} from "@/generated-types/queries";
import EntityElementWindowPanel from "../EntityElementWindowPanel.vue";
import { computed } from "vue";
import BaseExpandButton from "../base/BaseExpandButton.vue";
import { useColumnResizeHelper } from "@/composables/useResizeHelper";
import { useI18n } from "vue-i18n";
import { useEditMode } from "@/composables/useEdit";
import MetadataEditButton from "@/components/MetadataEditButton.vue";
import { auth } from "@/main";

const props = defineProps<{
  element: WindowElement;
  identifiers: string[];
  isEditOverwrite?: boolean;
  formId: string;
}>();

const { t } = useI18n();
const { setColumnSizes, resetToDefaultSizes } = useColumnResizeHelper();
const { isEdit } = useEditMode();
const computedIsEdit = computed(() => props.isEditOverwrite || isEdit.value);

const resizeColumn = (toggled: Boolean) => {
  if (toggled) {
    setColumnSizes(props.formId, [ColumnSizes.Fifty, ColumnSizes.Fifty]);
  } else {
    resetToDefaultSizes(props.formId);
  }
};

const panels = computed<WindowElementPanel[]>(() => {
  const returnArray: WindowElementPanel[] = [];

  Object.values(props.element).forEach((value) => {
    if (
      typeof value === "object" &&
      value?.__typename === "WindowElementPanel"
    ) {
      returnArray.push(value);
    }
  });
  return returnArray;
});
</script>
