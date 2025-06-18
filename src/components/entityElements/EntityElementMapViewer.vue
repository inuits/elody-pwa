<template>
  <entity-element-wrapper
    :isCollapsed="element.isCollapsed"
    :entity-id="entityId"
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
        <HeatMap
          v-if="element.type === MapTypes.HeatMap"
          :center="center"
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
} from "@/generated-types/queries";
import EntityElementWrapper from "@/components/base/EntityElementWrapper.vue";
import { getValueForPanelMetadata } from "@/helpers";
import { computed, inject } from "vue";
import { useMapCenter } from "@/composables/useMapCenter";
import WktMap from "@/components/maps/WktMap.vue";
import HeatMap from "@/components/maps/HeatMap.vue";

const props = defineProps<{
  element: MapElement;
  entityId: string;
}>();

const entity: any = inject("ParentEntityProvider");

const shouldDisplayMap = computed(() => {
  return (
    mapData.value.length > 0 ||
    center.value.some((value: number) => !isNaN(value))
  );
});

const { center } = useMapCenter(props.element, props.entityId);

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
