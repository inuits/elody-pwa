<template>
  <div class="h-32 flex flex-1">
    <base-expand-button
      v-if="
        element.expandButtonOptions?.shown &&
        element.expandButtonOptions?.orientation === Orientations.Left
      "
      :orientation="element.expandButtonOptions.orientation"
      v-on:expand-media-list="resizeColumn"
    />
    <div
      class="h-full overflow-y-scroll w-full border-solid border-neutral-30 border-2 bg-neutral-0 rounded-t-md"
    >
      <div class="border-solid border-neutral-30 border-b-2 pb-2 rounded-t-md">
        <h1 class="subtitle text-text-body p-2">{{ element.label }}</h1>
      </div>
      <div class="flex">
        <div v-for="(action, index) in actions" :key="index">
          <button
            class="rounded m-2 p-2 bg-[var(--color-accent-normal)] text-neutral-0 cursor-pointer"
            @click="performAction(action)"
          >
            {{ action }}
          </button>
        </div>
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
  TypeModals,
  Orientations,
  Actions,
} from "@/generated-types/queries";
import EntityElementWindowPanel from "./EntityElementWindowPanel.vue";
import { computed } from "vue";
import BaseExpandButton from "./base/BaseExpandButton.vue";
import { useColumnResizeHelper } from "@/composables/useResizeHelper";
import { getEntityIdFromRoute } from "@/helpers";
import useMetaDataHelper from "@/composables/useMetaDataHelper";
const { mediafiles } = useMetaDataHelper();
const props = defineProps<{
  element: WindowElement;
}>();

const { setColumnSizes, resetToDefaultSizes } = useColumnResizeHelper();
const entityID = getEntityIdFromRoute() || "";
import { useAvailableModals } from "@/composables/useAvailableModals";
const { getModal } = useAvailableModals();

const resizeColumn = (toggled: Boolean) => {
  if (toggled) {
    setColumnSizes([ColumnSizes.Fifty, ColumnSizes.Fifty]);
  } else {
    resetToDefaultSizes();
  }
};

const actions = computed<Actions[]>(() => {
  const returnArray: Actions[] = [];

  Object.values(props.element.actions).forEach((action) => {
    returnArray.push(action as Actions);
  });
  return returnArray;
});

async function performAction(type: Actions) {
  const actions = {
    ocr: () => getModal(TypeModals.Ocr).openModal()
    download: () => {
      for (const mf of mediafiles.value) {
        const mediafileID = mf._id;
        console.log("Mediafile found", mediafileID);
      }
    }

    const action = actions[type]

    if (!action) {
      console.log('This action does not exist')
      return
    }

    action()
  }
}
</script>
