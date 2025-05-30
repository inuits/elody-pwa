<template>
  <div :class="['h-full w-full overflow-hidden']">
    <div v-if="parsedMapData.coordinates" class="h-[50vh] w-full">
      <l-map
        :use-global-leaflet="false"
        ref="map"
        v-model:zoom="zoom"
        :center="parsedMapData.coordinates as PointExpression"
        @click="getMapCoordinates"
        :options="{ attributionControl: false }"
      >
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
        ></l-tile-layer>
        <l-marker :lat-lng="parsedMapData.coordinates as LatLngExpression">
          <l-icon
            :icon-size="customIcon.iconSize"
            :icon-anchor="customIcon.iconAnchor"
            :icon-url="customIcon.iconUrl"
          ></l-icon>
          <l-tooltip v-if="parsedMapData.name">{{
            parsedMapData.name
          }}</l-tooltip></l-marker
        >
      </l-map>
    </div>
    <div class="bg-neutral-0 w-full pb-2">
      <div v-for="data in mapData" class="px-2 py-1" :key="data.key">
        <entity-element-coordinate-edit
          v-if="data.inputField && data.unit === Unit.CoordinatesDefault"
          :fieldKey="data.key"
          :label="data.label"
          v-model:value="data.value"
          :input-field="data.inputField"
          :entity-uuid="entityUuid"
        />
        <metadata-wrapper
          v-else
          :form-id="formId"
          :is-edit="isEdit"
          v-model:metadata="data as MetadataField"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import "leaflet/dist/leaflet.css";
import {
  LMap,
  LTileLayer,
  LMarker,
  LTooltip,
  LIcon,
} from "@vue-leaflet/vue-leaflet";
import {
  type LatLngExpression,
  type LeafletMouseEvent,
  type PointExpression,
} from "leaflet";
import { computed, ref } from "vue";
import { useEditMode } from "@/composables/useEdit";
import EntityElementCoordinateEdit from "../EntityElementCoordinateEdit.vue";
import type { MediaFileElement } from "@/generated-types/queries";
import { type MetadataField, Unit } from "@/generated-types/queries";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";

const props = defineProps<{
  element: MediaFileElement;
  mapData: any[];
  entityUuid: string;
}>();

const zoom = ref<number>(15);
const formId = computed(() => props.entityUuid);
const { isEdit } = useEditMode();

const createNewCoordinatesObject = (coordinatesObject: any) => {
  coordinatesObject.value = { longitude: 1, latitude: 1 };
  return coordinatesObject.value;
};

const parsedMapData = computed(() => {
  const coordinatesObject = props.mapData.find(
    (dataItem) => dataItem.key === "location",
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

const customIcon = {
  iconUrl: "/marker.svg",
  iconSize: [32, 37],
  iconAnchor: [16, 37],
};
</script>
