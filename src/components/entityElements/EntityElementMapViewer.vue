<template>
  <entity-element-wrapper
    :isCollapsed="element.isCollapsed"
    :label="element.label"
    :use-vshow-instead-of-vif="element.type === MediaFileElementTypes.Map"
    class="flex flex-col h-full"
  >
    <template v-slot:content>
      <div class="mx-1 mb-1 bg-neutral-lightest">
        <WktMap
          v-if="element.type === MapTypes.WktMap && shouldDisplayMap"
          :wkt="mapData"
          :center="center"
        />
      </div>
    </template>
  </entity-element-wrapper>
</template>

<script lang="ts" setup>
import {
  MediaFileElementTypes,
  type MapElement,
  type PanelMetaData,
  PanelType,
  MapTypes,
} from "@/generated-types/queries";
import EntityElementWrapper from "@/components/base/EntityElementWrapper.vue";
import { getValueForPanelMetadata } from "@/helpers";
import { computed } from "vue";
import WktMap from "../maps/WktMap.vue";
import { useMaps } from "@/composables/useMaps";

const props = defineProps<{
  element: MapElement;
  entityId: string;
}>();

const shouldDisplayMap = computed(() => {
  return mapData.value.length > 0;
});

const center = computed(() => {
  const metdataCenterValue = getValueForPanelMetadata(
    PanelType.Metadata,
    props.element.center,
    props.entityId,
    "",
  ) as string | { latitude: number; longitude: number };

  return [
    (metdataCenterValue as { latitude: number }).latitude,
    (metdataCenterValue as { longitude: number }).longitude,
  ];
});

const mapData = computed(() => {
  const returnArray: string[] = [];
  Object.values(props.element).forEach((value) => {
    if (typeof value === "object" && value.__typename === "PanelMetaData") {
      returnArray.push(
        getValueForPanelMetadata(
          PanelType.Metadata,
          (value as PanelMetaData).key,
          props.entityId,
          "",
        ),
      );
    }
  });
  return returnArray.filter((item) => item);
});
</script>
