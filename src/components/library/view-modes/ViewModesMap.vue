<template>
  <HeatMap
    v-if="getBasicMapProperties(config).mapType === MapTypes.HeatMap"
    :config="config"
    :entities="entities"
  />
  <WktMap
    v-if="getBasicMapProperties(config).mapType === MapTypes.WktMap"
    :wkt="wktOfEntities"
    :center="center"
  />
</template>

<script setup lang="ts">
import {
  type ConfigItem,
  type Entity,
  MapTypes,
} from "@/generated-types/queries";
import HeatMap from "@/components/maps/HeatMap.vue";
import WktMap from "@/components/maps/WktMap.vue";
import { useMaps } from "@/composables/useMaps";
import { computed } from "vue";

const props = defineProps<{
  config: ConfigItem[];
  entities: Entity[];
}>();

const { getBasicMapProperties } = useMaps();

const wktOfEntities = computed(() => {
  const wkts: string[] = props.entities.map((entity: Entity) => {
    return entity.intialValues?.map_location;
  });

  return wkts.filter((item: string) => !!item);
});

const center = computed(() => {
  const coordinates = props.entities[0].intialValues?.gps_coordinates;

  return [
    (coordinates as { latitude: number }).latitude,
    (coordinates as { longitude: number }).longitude,
  ];
});
</script>

<style scoped></style>
