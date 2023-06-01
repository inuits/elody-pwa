<template>
  <div :class="['h-full w-full overflow-hidden']">
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
    <div class="info bg-neutral-0 w-full overflow-y-scroll">
      <div v-for="data in parsedMetadata" class="px-2 py-1" :key="data.key">
        <EntityElementMetadata
          v-if="!isEdit || !data.field"
          :label="data.label"
          :value="data.value"
        ></EntityElementMetadata>
        <entity-element-metadata-edit
          v-else-if="data.field"
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
import type { LeafletMouseEvent } from "leaflet";
import { computed, ref } from "vue";
import EntityElementMetadata from "../EntityElementMetadata.vue";
import EntityElementMetadataEdit from "../EntityElementMetadataEdit.vue";
import type {
  MediaFileElement,
  MetadataAndRelation,
  MetadataField,
} from "@/generated-types/queries";
import { useEditMode } from "@/composables/useEdit";

const props = defineProps<{
  element: MediaFileElement;
  mapData: MetadataAndRelation[];
}>();

const zoom = ref<number>(15);
const { isEdit } = useEditMode();

const parsedMetadata = computed(() => {
  const parsedData: any[] = [];
  props.mapData.forEach((dataItem) => {
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
  const locationdata = props.mapData.find(
    (dataItem) => dataItem.key === "location"
  )?.value;
  return {
    coordinates: [locationdata.latitude, locationdata.longitude],
    name: props.mapData.find((dataItem) => dataItem.key === "name")?.value,
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
