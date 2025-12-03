<template>
  <HeatMap
    v-if="refMapType === MapTypes.HeatMap"
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
    :map-view="mapView"
    :map-mode="mapMode"
  />
</template>

<script setup lang="ts">
import {
  type ConfigItem,
  type Entity,
  MapTypes,
  MapModes,
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

const refMapType = ref<MapTypes | undefined>(undefined);

const wktOfEntities = computed(() => {
  if (mapMode.value === MapModes.Default) {
    return getBasicWkts();
  }

  if (mapMode.value === MapModes.HeatMode) {
    return getHeatWkt();
  }

  return [];
});

const getBasicWkts = () => {
  const wkts: string[] = props.entities.map((entity: Entity) => {
    return entity.intialValues?.map_location;
  });

  return wkts.filter((item: string) => !!item);
};

const getHeatWkt = () => {
  const wkts: { coordinates: string; heatIntensity?: number }[] =
    props.entities.map((entity: Entity) => {
      return {
        coordinates: entity.intialValues?.map_location,
        heatIntensity:
          entity.intialValues?.[mapProperties.value.keyOfHeatValue || ""] || 0,
      };
    });

  return wkts.filter((item) => !!item.coordinates);
};

const mapView = computed(() => {
  return mapProperties.value.mapView;
});

const mapMode = computed(() => {
  return mapProperties.value.mapMode;
});

const mapProperties = computed(() => {
  return getBasicMapProperties(props.config);
});

const center = ref<number[]>();
const calculateCenter = (entities: Entity[]) => {
  let entity = entities?.find(
    (item) => item.type === props.entityTypeAsCenterPoint,
  );
  if (!entity) {
    entity = entities?.[0];
  }
  const keyToGetCoordinates = props.centerCoordinatesKey || "gps_coordinates";
  let coordinates = entity?.intialValues?.[keyToGetCoordinates];
  if (coordinates) {
    center.value = [
      (coordinates as { latitude: number }).latitude,
      (coordinates as { longitude: number }).longitude,
    ];
  }

  coordinates = mapProperties.value.center;
  if (coordinates) {
    center.value = fromLonLat([coordinates[1], coordinates[0]]);
  }
};

watch(
  () => props.mapType,
  () => {
    if (props.mapType !== undefined) {
      refMapType.value = props.mapType;
    }
  },
  { immediate: true },
);

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
