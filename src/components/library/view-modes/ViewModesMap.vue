<template>
  <HeatMap
    v-if="mapType === MapTypes.HeatMap"
    :config="config"
    :entities="entities"
    :entities-loading="entitiesLoading"
    :center="center"
    :zoom="getBasicMapProperties(config).zoom"
    :blur="getBasicMapProperties(config).blur"
    :radius="getBasicMapProperties(config).radius"
    :filters-base-api="filtersBaseApi"
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
import { FiltersBaseAPI } from "@/components/filters/FiltersBase.vue";
import HeatMap from "@/components/maps/HeatMap.vue";
import WktMap from "@/components/maps/WktMap.vue";
import { useMaps } from "@/composables/useMaps";
import { computed, ref, watch } from "vue";
import { fromLonLat } from "ol/proj";

const props = withDefaults(
  defineProps<{
    mapType: MapTypes;
    config: ConfigItem[];
    entities: Entity[];
    entitiesLoading: boolean;
    filtersBaseApi?: FiltersBaseAPI;
    entityTypeAsCenterPoint: string;
    centerCoordinatesKey: string;
  }>(),
  {
    filtersBaseApi: undefined,
  },
);

const { getBasicMapProperties } = useMaps();

const mapType = ref<MapTypes | undefined>(undefined);

const wktOfEntities = computed(() => {
  const wkts: string[] = props.entities.map((entity: Entity) => {
    return entity.intialValues?.map_location;
  });

  return wkts.filter((item: string) => !!item);
});

const center = ref<number[]>();
const calculateCenter = (entities: Entity[]) => {
  let coordinates =
    entities.length > 0
      ? entities[0].intialValues?.gps_coordinates
      : undefined;
  if (coordinates) {
    center.value = fromLonLat([coordinates[1], coordinates[0]]);
  }
  coordinates = getBasicMapProperties(props.config).center;
  if (coordinates) {
    center.value = fromLonLat([coordinates[1], coordinates[0]]);
  }
}

watch(
  () => props.mapType,
  () => {
    if (props.mapType !== undefined) {
      mapType.value = props.mapType;
    }
  },
  { immediate: true },
);

// const entities = computed(() => props.entities.value)
watch(
  () => props.entities,
  () => {
    if (props.entitiesLoading || !props.entities) return;
    calculateCenter(props.entities);
  },
  { immediate: true },
);
</script>

<style scoped></style>
