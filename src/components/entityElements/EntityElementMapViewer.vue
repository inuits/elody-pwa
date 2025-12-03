<template>
  <entity-element-wrapper
    :isCollapsed="element.isCollapsed"
    :entity-id="entityId"
    :label="element.label"
    :use-vshow-instead-of-vif="element.type === MediaFileElementTypes.Map"
    class="flex flex-col h-full"
  >
    <template v-slot:content>
      <div class="mx-1 mb-1 bg-background-normal">
        <WktMap
          v-if="element.type === MapTypes.WktMap && shouldDisplayMap"
          :wkt="mapData"
          :center="center"
          :map-view="mapConfig.mapView"
          :map-mode="mapConfig.mapMode"
        />
        <HeatMap
          v-if="element.type === MapTypes.HeatMap"
          :center="center"
          :zoom="mapConfig.zoom"
          :blur="mapConfig.blur"
          :radius="mapConfig.radius"
          :config="element.config"
          :entities="entity !== undefined ? [entity] : undefined"
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
  MapModes,
} from "@/generated-types/queries";
import EntityElementWrapper from "@/components/base/EntityElementWrapper.vue";
import { getValueForPanelMetadata } from "@/helpers";
import { computed, inject } from "vue";
import { useMapCenter } from "@/composables/useMapCenter";
import WktMap from "@/components/maps/WktMap.vue";
import HeatMap from "@/components/maps/HeatMap.vue";
import { useMaps } from "@/composables/useMaps";

const { getBasicMapProperties } = useMaps();

const props = defineProps<{
  element: MapElement;
  entityId: string;
}>();

const entity: any = inject("ParentEntityProvider");

const mapConfig = computed(() => {
  return getBasicMapProperties(props.element?.config || []);
});

const shouldDisplayMap = computed(() => {
  return (
    mapData.value.length > 0 ||
    center.value.some((value: number) => !isNaN(value))
  );
});

const { center } = useMapCenter(props.element, props.entityId);

const getPanelMetadataValueByKey = (key: string) => {
  return getValueForPanelMetadata(PanelType.Metadata, key, props.entityId, "");
};

const mapData = computed(() => {
  const returnArray: (
    | string
    | { coordinates: string; heatIntensity: number }
  )[] = [];
  Object.values(props.element).forEach((value) => {
    if (typeof value === "object" && value.__typename === "PanelMetaData") {
      const wkt = getPanelMetadataValueByKey((value as PanelMetaData).key);

      if (mapConfig.value.mapMode === MapModes.HeatMode) {
        returnArray.push({
          coordinates: wkt,
          heatIntensity:
            Number(
              getPanelMetadataValueByKey(mapConfig.value.keyOfHeatValue),
            ) || 0,
        });
      } else {
        returnArray.push(wkt as string);
      }
    }
  });

  return returnArray.filter((item) => {
    if (typeof item === "string") {
      return !!item;
    }

    return !!item.coordinates;
  });
});
</script>
