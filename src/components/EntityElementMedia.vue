<template>
  <entity-element-wrapper
    :isCollapsed="element.isCollapsed"
    :label="element.label"
    class="flex flex-col h-full"
  >
    <template v-slot:actions>
      <div
        v-if="isEdit"
        class="flex items-center text-accent-normal cursor-pointer"
      >
        <unicon height="16" :name="Unicons.PlusCircle.name" />
        <p class="underline" @click="openPickEntityModal([])">
          Voeg bestand toe
        </p>
      </div>
    </template>
    <template v-slot:content>
      <!-- Not yet refactored old component -->
      <media-viewer
        v-if="
          !element.isCollapsed && element.type === MediaFileElementTypes.Media
        "
        :loading="false"
        entityType="MediaFile"
        class="flex-1"
      />
      <base-map
        v-if="
          !element.isCollapsed &&
          element.type === MediaFileElementTypes.Map &&
          mapComponentData
        "
        :element="element"
        :mapData="mapComponentData"
      ></base-map>
    </template>
  </entity-element-wrapper>
</template>
<script lang="ts" setup>
import EntityElementWrapper from "./base/EntityElementWrapper.vue";
import MediaViewer from "./base/Mediaviewer.vue";
import useEditMode from "@/composables/useEdit";
import { Unicons } from "@/types";
import { usePickEntityModal } from "./PickEntityModal.vue";
import {
  type MediaFileElement,
  MediaFileElementTypes,
  type PanelMetaData,
  PanelType,
  type MetadataAndRelation,
} from "@/generated-types/queries";
import BaseMap from "./base/BaseMap.vue";
import { computed } from "vue";
import { getValueForPanelMetadata } from "@/helpers";

const props = defineProps<{
  element: MediaFileElement;
}>();

const mapComponentData = computed(() => {
  const returnArray: MetadataAndRelation[] = [];

  Object.values(props.element).forEach((value) => {
    if (typeof value === "object" && value.__typename === "PanelMetaData") {
      const metadataItemKey: string = (value as PanelMetaData).key;
      const metadataObject = {
        key: metadataItemKey,
        label: (value as PanelMetaData).label,
        value: getValueForPanelMetadata(PanelType.Metadata, metadataItemKey),
        field: (value as PanelMetaData).inputField,
      };
      returnArray.push(metadataObject);
    }
  });
  return returnArray;
});

const { isEdit } = useEditMode();
const { openPickEntityModal } = usePickEntityModal();
</script>
