<template>
  <div class="relative">
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
import {
  ref,
  onBeforeMount,
  watch,
  shallowReactive,
  onMounted,
  onBeforeUnmount,
  nextTick,
} from "vue";
import debounce from "lodash.debounce";
import {
  type Item,
  Map as OLMap,
  Layers,
  Sources,
  MapControls,
} from "vue3-openlayers";
import VectorSource from "ol/source/Vector";
import View from "ol/View";
import { Feature } from "ol";
import {
  type AdvancedFilters,
  type AdvancedFilter,
  type ConfigItem,
  type Entity,
} from "@/generated-types/queries";
import { FiltersBaseAPI } from "@/components/filters/FiltersBase.vue";
import { useMaps } from "@/composables/useMaps";
import GeoJSON from "ol/format/GeoJSON";

const props = withDefaults(
  defineProps<{
    config: ConfigItem[];
    entities: Entity[];
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
  extractGeojsonFeaturesFromEntities,
  handlePointerMove,
} = useMaps();

const mapRef = ref<InstanceType<typeof OLMap.OlMap> | undefined>(undefined);
const heatmapSource = shallowReactive(new VectorSource());
const view = ref<View | undefined>(undefined);
const contextMenuItems = ref<Item[]>([]);
const geoFilters = ref<AdvancedFilters | undefined>(undefined);
const hotspotZoomed = ref<boolean>(false);

contextMenuItems.value = [
  {
    text: t("map.center-map"),
    callback: (val) => {
      view.value?.setCenter(val.coordinate);
    },
  },
  "-",
];

const clearAndAddFeatures = (features: Feature[]) => {
  heatmapSource.clear();
  heatmapSource.addFeatures(features);
};

const safeAddFeatures = (features: Feature[]): void => {
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => clearAndAddFeatures(features));
  } else {
    // Fallback for older browsers
    setTimeout(() => clearAndAddFeatures(features), 0);
  }
};

const updateHeatmapFromGeoJson = (newEntities: Entity[]) => {
  const geojsonFeatures = {
    type: "FeatureCollection",
    features: extractGeojsonFeaturesFromEntities(newEntities),
  };
  const format = new GeoJSON();
  const features = format.readFeatures(geojsonFeatures, {
    dataProjection: "EPSG:3857",
    featureProjection: "EPSG:3857",
  });
  safeAddFeatures(features);
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

const addViewToMap = () => {
  view.value = new View({
    center: props.center,
    zoom: props.zoom,
  });
  mapRef.value?.map.setView(view.value);
};

const initializeHeatmap = async () => {
  geoFilters.value = await fetchGeoFilter();
  handleMoveBoundingBox();
};

const zoomToHotspot = () => {
  const map = mapRef.value?.map;
  const src = heatmapSource;

  if (map && src && src.getFeatures().length > 0 && !hotspotZoomed.value) {
    const features = src.getFeatures();
    if (!features.length) return;

    const coords = features.map((f) => f.getGeometry().getCoordinates());
    const avg = coords
      .reduce((acc, c) => [acc[0] + c[0], acc[1] + c[1]], [0, 0])
      .map((v) => v / coords.length);

    map.getView().animate({
      center: avg,
      zoom: 10,
      duration: 800,
    });
    hotspotZoomed.value = true;
  }
};

onBeforeMount(async () => await initializeHeatmap());
onMounted(() => addViewToMap());
onBeforeUnmount(() => {
  if (!props.filtersBaseApi) return;
  Object.values(geoFilters.value)?.forEach((advancedFilter: AdvancedFilter) => {
    props.filtersBaseApi.removeFilterFromList(advancedFilter.key);
  });
});

watch(
  () => props.entities,
  async (newEntities) => {
    if (props.entitiesLoading || !newEntities?.length) return;

    updateHeatmapFromGeoJson(newEntities);

    await nextTick();
    zoomToHotspot();
  },
  { immediate: true },
);
</script>

<style scoped></style>
