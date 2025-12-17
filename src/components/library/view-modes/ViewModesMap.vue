<template>
  <HeatMap
    v-if="refMapType === MapTypes.HeatMap"
    :config="config"
    :entities="entities"
    :entities-loading="entitiesLoading"
    :center="center"
    :zoom="mapProperties.zoom"
    :blur="mapProperties.blur"
    :radius="mapProperties.radius"
    :filters-base-api="filtersBaseApi"
    :geo-filters="geoFilters"
  />
  <WktMap
    v-if="refMapType === MapTypes.WktMap"
    :wkt="wktOfEntities"
    :center="center"
    :map-view="mapView"
    :map-mode="mapMode"
    :filters-base-api="filtersBaseApi"
    :use-filters="useFilters"
    :geo-filters="geoFilters"
  />
</template>

<script setup lang="ts">
import {
  type ConfigItem,
  type Entity,
  MapTypes,
  MapModes,
  AdvancedFilters,
  AdvancedFilter,
  AdvancedFilterInput,
} from "@/generated-types/queries";
import { FiltersBaseAPI } from "@/components/filters/FiltersBase.vue";
import HeatMap from "@/components/maps/HeatMap.vue";
import WktMap from "@/components/maps/WktMap.vue";
import { useMaps } from "@/composables/useMaps";
import { computed, ref, watch, onMounted, onUnmounted } from "vue";
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
    setPaginationLimit: (limit: number, forceFetch?: boolean) => void;
    setAdvancedFilters: (filters: AdvancedFilterInput[]) => void;
  }>(),
  {
    filtersBaseApi: undefined,
    setPaginationLimit: () => {},
    setAdvancedFilters: () => {},
  },
);

const { getBasicMapProperties, fetchGeoFilter } = useMaps();

const refMapType = ref<MapTypes | undefined>(undefined);
const geoFilters = ref<AdvancedFilters | undefined>(undefined);

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
  return mapProperties.value.mapMode || MapModes.Default;
});

const useFilters = computed(() => {
  return mapProperties.value.useFilters;
});

const mapProperties = ref(getBasicMapProperties(props.config));

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

const updateMapProperties = () => {
  if (refMapType.value === MapTypes.HeatMap) {
    props.setPaginationLimit(-1);
  }

  if (refMapType.value == MapTypes.WktMap) {
    props.setPaginationLimit(1000);
  }
};

const getGeoFilter = async (): Promise<AdvancedFilters | undefined> => {
  if (!props.filtersBaseApi || !useFilters.value) return;
  geoFilters.value = await fetchGeoFilter();
};

watch(
  () => props.mapType,
  () => {
    if (props.mapType !== undefined) {
      refMapType.value = props.mapType;
      updateMapProperties();
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

onUnmounted(() => {
  if (!props.filtersBaseApi || !geoFilters.value) return;
  Object.values(geoFilters.value)?.forEach((filter: AdvancedFilter) => {
    props.filtersBaseApi?.removeFilterFromList(filter?.key);
  });
  props.setAdvancedFilters(props.filtersBaseApi?.getNormalizedFiltersForApi());
  props.setPaginationLimit(20, true);
});

onMounted(async () => {
  await getGeoFilter();
});
</script>

<style scoped></style>
