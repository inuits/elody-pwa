<template>
  <div :class="['h-full w-full overflow-hidden']">
    <div v-if="parsedMapData.coordinates" class="h-[50vh] w-full">
      <l-map
        :use-global-leaflet="false"
        ref="map"
        v-model:zoom="zoom"
        :center="(parsedMapData.coordinates as PointExpression)"
        @click="getMapCoordinates"
        :options="{ attributionControl: false }"
      >
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
        ></l-tile-layer>
        <l-marker
          :icon="icon"
          :lat-lng="(parsedMapData.coordinates as LatLngExpression)"
          ><l-tooltip v-if="parsedMapData.name">{{
            parsedMapData.name
          }}</l-tooltip></l-marker
        >
      </l-map>
    </div>
    <div class="info bg-neutral-0 w-full overflow-y-scroll">
      <div v-for="data in mapData" class="px-2 py-1" :key="data.key">
        <EntityElementMetadata
          v-if="!isEdit || !data.field"
          :label="data.label"
          :value="data.value"
          :unit="data.unit"
        ></EntityElementMetadata>
        <entity-element-coordinate-edit
          v-else-if="
            data.field && isEdit && data.unit === Unit.CoordinatesDefault
          "
          :fieldKey="data.key"
          :label="data.label"
          v-model:value="data.value"
          :field="data.field"
        />
        <entity-element-metadata-edit
          v-else-if="data.field && isEdit"
          :fieldKey="data.key"
          :label="data.label"
          v-model:value="data.value"
          :field="data.field"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker, LTooltip } from "@vue-leaflet/vue-leaflet";
import {
  Icon,
  type LatLngExpression,
  type LeafletMouseEvent,
  type PointExpression,
} from "leaflet";
import { computed, ref } from "vue";
import EntityElementMetadata from "../EntityElementMetadata.vue";
import EntityElementMetadataEdit from "../EntityElementMetadataEdit.vue";
import EntityElementCoordinateEdit from "../EntityElementCoordinateEdit.vue";
import type { MediaFileElement } from "@/generated-types/queries";
import { useEditMode } from "@/composables/useEdit";
import { Unit } from "@/generated-types/queries";

const props = defineProps<{
  element: MediaFileElement;
  mapData: any[];
}>();

const zoom = ref<number>(15);
const { isEdit } = useEditMode();

const createNewCoordinatesObject = (coordinatesObject: any) => {
  coordinatesObject.value = { longitude: 1, latitude: 1 };
  return coordinatesObject.value;
};

const parsedMapData = computed(() => {
  const coordinatesObject = props.mapData.find(
    (dataItem) => dataItem.key === "location"
  );
  let coordinates = coordinatesObject.value;

  if (!coordinates) coordinates = createNewCoordinatesObject(coordinatesObject);

  return {
    coordinates: [coordinates.latitude, coordinates.longitude],
    name: props.mapData.find((dataItem) => dataItem.key === "name")?.value,
  };
});

const getMapCoordinates = (e: LeafletMouseEvent | undefined) => {
  console.log(props);
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
