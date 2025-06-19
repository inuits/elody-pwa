<template>
  <div class="relative">
    <div
      v-if="entitiesLoading"
      class="absolute inset-0 bg-white/60 z-50 flex items-center justify-center"
    >
      <spinner-loader theme="accent" />
    </div>
    <OLMap.OlMap
      ref="mapRef"
      :loadTilesWhileAnimating="true"
      :loadTilesWhileInteracting="true"
      style="height: 65vh"
      @moveend="debouncedHandleMoveBoundingBox"
      @pointermove="(event) => handlePointerMove(event, mapRef)"
    >
      <Layers.OlTileLayer>
        <Sources.OlSourceOsm />
      </Layers.OlTileLayer>

      <Layers.OlHeatmapLayer
        title="heatmap"
        :source="heatmapSource"
        :blur="blur"
        :radius="radius"
        :weight="heatmapWeight"
        :zIndex="1"
      >
      </Layers.OlHeatmapLayer>

      <MapControls.OlContextMenuControl :items="contextMenuItems" />

      <MapControls.OlFullscreenControl />
    </OLMap.OlMap>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, onBeforeMount, watch, shallowReactive, onMounted, onBeforeUnmount } from "vue";
import debounce from 'lodash.debounce';
import {
  type Item,
  Map as OLMap,
  Layers,
  Sources,
  MapControls,
} from "vue3-openlayers";
import VectorSource from 'ol/source/Vector';
import View from 'ol/View';
import { Feature } from "ol";
import { Point } from "ol/geom";
import { fromLonLat } from "ol/proj";
import {
  type AdvancedFilters,
  type AdvancedFilter,
  type ConfigItem,
  type Entity,
} from "@/generated-types/queries";
import { FiltersBaseAPI } from "@/components/filters/FiltersBase.vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import { useMaps } from "@/composables/useMaps";

const props = withDefaults(
  defineProps<{
    config: ConfigItem[];
    entities: Object;
    entitiesLoading: boolean;
    center: number[];
    zoom: number;
    blur: number;
    radius: number;
    filtersBaseApi?: FiltersBaseAPI;
  }>(),
  {
    center: undefined,
    filtersBaseApi: undefined,
  },
);

const { t } = useI18n();
const {
  activateNewGeoFilter,
  fetchGeoFilter,
  getGeojsonPolygonFromMap,
  handlePointerMove
} = useMaps();

const mapRef = ref<InstanceType<typeof OLMap.OlMap> | undefined>(undefined);
const heatmapSource = shallowReactive(new VectorSource());
const view = ref<View | undefined>(undefined);
const contextMenuItems = ref<Item[]>([]);
const geoFilters = ref<AdvancedFilters | undefined>(undefined);
const featureCache = new Map<string, Feature>();

contextMenuItems.value = [
  {
    text: t("map.center-map"),
    callback: (val) => {
      view.value?.setCenter(val.coordinate);
    },
  },
  "-",
];

const safeAddFeatures = (features: Feature[]): void => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      heatmapSource.addFeatures(features);
    });
  } else {
    // Fallback for older browsers
    setTimeout(() => heatmapSource.addFeatures(features), 0);
  }
};

const updateHeatmapFeatures = (newEntities: Entity[]) => {
  const newIds = new Set<string>();
  const newFeatures: Feature[] = [];

  for (const entity of newEntities) {
    const id = entity.id;
    newIds.add(id);
    const mapData = entity.mapElement || entity.entityView.column.elements.mapElement;
    if (!mapData || !mapData.coordinates?.value) continue;

    const existingFeature = featureCache.get(id);
    const newCoords = fromLonLat([
      mapData.coordinates.value[0],
      mapData.coordinates.value[1],
    ]);
    const newWeight = mapData.weight?.value ?? 10;

    if (existingFeature) {
      const existingGeom = existingFeature.getGeometry() as Point;
      const [x, y] = existingGeom.getCoordinates();
      const [nx, ny] = newCoords;

      const weightChanged = existingFeature.get("weight") !== newWeight;
      const coordsChanged = x !== nx || y !== ny;
      if (coordsChanged) existingFeature.setGeometry(new Point(newCoords));
      if (weightChanged) existingFeature.set("weight", newWeight);
    } else {
      const newFeature = new Feature({
        geometry: new Point(newCoords),
        weight: newWeight,
        id: id,
      });
      featureCache.set(id, newFeature);
      newFeatures.push(newFeature);
    }
  }

  for (const [id, feature] of featureCache) {
    if (!newIds.has(id)) {
      heatmapSource.removeFeature(feature);
      featureCache.delete(id);
    }
  }

  if (newFeatures.length > 0) safeAddFeatures(newFeatures);
};

const handleMoveBoundingBox = () => {
  if (!props.filtersBaseApi) return;
  const map = mapRef.value?.map;
  if (!map) return;

  const geojsonPolygon = getGeojsonPolygonFromMap(map);
  if (!geoFilters.value) return;
  activateNewGeoFilter(props.filtersBaseApi, geoFilters.value, geojsonPolygon);
};

const debouncedHandleMoveBoundingBox = debounce(() => {
  handleMoveBoundingBox();
}, 1000);


const heatmapWeight = (feature: Feature) => {
  const weight = feature.get("weight");
  return weight / 100;
};

const addViewToMap = () => {
  view.value = new View({
    center: props.center,
    zoom: props.zoom,
  });
  mapRef.value?.map.setView(view.value);
}

const initializeHeatmap = async () => {
  geoFilters.value = await fetchGeoFilter();
  handleMoveBoundingBox();
};

onBeforeMount( async () => await initializeHeatmap());
onMounted(() => addViewToMap());
onBeforeUnmount(() => {
  if (!props.filtersBaseApi) return;
  Object.values(geoFilters.value)?.forEach((advancedFilter: AdvancedFilter) => {
    props.filtersBaseApi.removeFilterFromList(advancedFilter.key);
  });
});

watch(
  () => props.entities,
  () => {
    if (props.entitiesLoading || props.entities?.length <= 0) return;
    updateHeatmapFeatures(props.entities);
  },
  { immediate: true },
);
</script>

<style scoped></style>
