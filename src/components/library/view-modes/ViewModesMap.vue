<template>
  <HeatMap
    v-if="mapType === MapTypes.HeatMap"
    :config="config"
    :entities="entities"
    :center="center"
    :zoom="getBasicMapProperties(config).zoom"
    :blur="getBasicMapProperties(config).blur"
    :radius="getBasicMapProperties(config).radius"
    :is-enabled-in-preview="isEnabledInPreview"
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
    isEnabledInPreview?: boolean;
    filtersBaseApi?: FiltersBaseAPI;
    entityTypeAsCenterPoint: string;
    centerCoordinatesKey: string;
  }>(),
  {
    isEnabledInPreview: false,
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

const center = computed(() => {
  let coordinates =
    props.entities.length > 0
      ? props.entities[0].intialValues?.gps_coordinates
      : undefined;
  if (coordinates) {
    return fromLonLat([coordinates[1], coordinates[0]]);
  }
  coordinates = getBasicMapProperties(props.config).center;
  if (coordinates) {
    return fromLonLat([coordinates[1], coordinates[0]]);
  }
});

watch(
  () => props.mapType,
  () => {
    if (props.mapType !== undefined) {
      mapType.value = props.mapType;
    }
  },
  { immediate: true },
);
</script>

<style scoped></style>
