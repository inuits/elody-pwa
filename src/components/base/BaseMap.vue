<template>
  <div :class="['h-full w-full']">
    <div class="map w-full">
      <l-map
        :use-global-leaflet="false"
        ref="map"
        v-model:zoom="zoom"
        :center="convertedCoordinates"
      >
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
        ></l-tile-layer>
        <l-marker :lat-lng="convertedCoordinates"></l-marker>
      </l-map>
    </div>
    <div class="info bg-neutral-0 w-full p-4 z-50">
      <EntityElementMetadata
        v-if="convertedCoordinates"
        label="Coordinates"
        :value="`${convertedCoordinates[0]}, ${convertedCoordinates[1]}`"
      ></EntityElementMetadata>
      <EntityElementMetadata
        v-if="type"
        label="Type"
        :value="type"
      ></EntityElementMetadata>
    </div>
  </div>
</template>

<script lang="ts" setup>
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet";
import { computed, ref } from "vue";
import EntityElementMetadata from "../EntityElementMetadata.vue";

const props = withDefaults(
  defineProps<{
    coordinates: string;
  }>(),
  {
    coordinates: "0,0",
  }
);

const type = ref<string>("");
const zoom = ref<number>(15);
const convertedCoordinates = computed(() => props.coordinates.split(","));
console.log({ convertedCoordinates });
</script>

<style scoped>
.map {
  height: 85%;
}
.info {
  height: 15%;
}
</style>
