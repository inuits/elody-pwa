<template>
  <div v-if="coordinates.length" class="h-full w-full">
    <div class="map w-full">
      <l-map
        :use-global-leaflet="false"
        ref="map"
        v-model:zoom="zoom"
        :center="coordinates"
      >
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
        ></l-tile-layer>
        <l-marker :lat-lng="coordinates"></l-marker>
      </l-map>
    </div>
    <div class="info bg-neutral-0 w-full p-4 z-50">
      <EntityElementMetadata
        v-if="coordinates"
        label="Coordinates"
        :value="`${coordinates[0]}, ${coordinates[1]}`"
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
import { ref } from "vue";
import EntityElementMetadata from "../EntityElementMetadata.vue";
import {
  type GetLocationQuery,
  GetLocationDocument,
  Entitytyping,
  type IotDevice,
} from "@/generated-types/queries";
import { useQuery } from "@vue/apollo-composable";
import { getEntityIdFromRoute } from "@/helpers";

const coordinates = ref<Array<number>>([]);
const type = ref<string>("");
const zoom = ref<number>(15);

const { onResult } = useQuery<GetLocationQuery>(GetLocationDocument, {
  id: getEntityIdFromRoute(),
  type: Entitytyping.Iotdevice,
});

onResult((queryResult) => {
  const entity: IotDevice | undefined | null = queryResult?.data
    ?.Entity as IotDevice;
  if (entity) {
    coordinates.value = entity.location?.coordinates as number[];
    type.value = entity.location?.type as string;
  }
});
</script>

<style scoped>
.map {
  height: 85%;
}
.info {
  height: 15%;
}
</style>
