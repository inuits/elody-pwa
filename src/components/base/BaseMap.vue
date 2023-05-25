<template>
  <div :class="['h-full w-full']">
    <div class="map w-full">
      <l-map
        :use-global-leaflet="false"
        ref="map"
        v-model:zoom="zoom"
        :center="parsedMapData.coordinates"
        @click="getMapCoordinates"
      >
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
        ></l-tile-layer>
        <l-marker :lat-lng="parsedMapData.coordinates"
          ><l-tooltip v-if="parsedMapData.name">{{
            parsedMapData.name
          }}</l-tooltip></l-marker
        >
      </l-map>
    </div>
    <div class="info bg-neutral-0 w-full p-4 z-50">
      <EntityElementMetadata
        v-for="data in parsedMetadata"
        :key="data.key"
        :label="data.label"
        :value="data.value"
      ></EntityElementMetadata>
    </div>
  </div>
</template>

<script lang="ts" setup>
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker, LTooltip } from "@vue-leaflet/vue-leaflet";
import type { LeafletMouseEvent } from "leaflet";
import { computed, ref } from "vue";
import EntityElementMetadata from "../EntityElementMetadata.vue";
import type { MetadataAndRelation } from "@/generated-types/queries";

const props = defineProps<{
  metadata: MetadataAndRelation[];
}>();

const zoom = ref<number>(15);

const parsedMetadata = computed(() => {
  const parsedData: any[] = [];
  props.metadata.forEach((dataItem) => {
    if (typeof dataItem.value === "string") {
      parsedData.push(dataItem);
    } else {
      const newDataItem = { ...dataItem };
      newDataItem.value = Object.values(dataItem.value).toString();
      parsedData.push(newDataItem);
    }
  });
  return parsedData;
});

const parsedMapData = computed(() => {
  const locationdata = props.metadata.find(
    (dataItem) => dataItem.key === "location"
  )?.value;
  return {
    coordinates: [locationdata.latitude, locationdata.longitude],
    name: props.metadata.find((dataItem) => dataItem.key === "name")?.value,
  };
});

const getMapCoordinates = (e: LeafletMouseEvent | undefined) => {
  if (e) {
    console.log(e.latlng);
  }
};
</script>

<style scoped>
.map {
  height: 80%;
}
.info {
  height: 20%;
}
</style>
