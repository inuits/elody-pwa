<template>
  <div class="relative">
    <OLMap.OlMap
      ref="mapRef"
      :loadTilesWhileAnimating="true"
      :loadTilesWhileInteracting="true"
      style="height: 65vh"
      @moveend="debouncedHandleMoveBoundingBox"
      @pointermove="(event) => handlePointerMove(event, mapRef)"
      @singleclick="handleMapClick"
    >
      <OLMap.OlOverlay
        v-if="detailPopUp.isVisible && popUpDetailConfiguration"
        :position="detailPopUp.position"
        :offset="[0, -15]"
        positioning="bottom-center"
        :autoPan="true"
      >
        <div class="bg-white rounded shadow-lg p-3 text-sm w-48">
          <div
            v-if="featureLoading"
            class="h-full w-full flex items-center justify-center py-4"
          >
            <spinner-loader theme="accent" dimensions="10" />
          </div>
          <div v-else-if="featureResult">
            <div class="flex justify-end items-center">
              <button @click="detailPopUp.isVisible = false">
                <unicon
                  class="cursor-pointer"
                  :name="Unicons.Close.name"
                  :height="18"
                />
              </button>
            </div>
            <div>
              <div
                v-for="item of popUpDetailConfiguration"
                :key="item.key"
                class="pb-2"
              >
                <div v-if="featureResult.Entity.intialValues[item.key]">
                  <p class="font-bold">{{ t(item.label) }}</p>
                  <p>{{ featureResult.Entity.intialValues[item.key] }}</p>
                </div>
              </div>
              <router-link
                class="underline text-accent-accent"
                :to="`/${featureResult.Entity.type}/${featureResult.Entity.id}`"
                target="_blank"
                >Open in other tab</router-link
              >
            </div>
          </div>
        </div>
      </OLMap.OlOverlay>
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
  computed,
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
  type Entity,
  GetEntityByIdDocument,
  type GetEntityByIdQuery,
  type GetEntityByIdQueryVariables,
} from "@/generated-types/queries";
import { FiltersBaseAPI } from "@/components/filters/FiltersBase.vue";
import { useMaps } from "@/composables/useMaps";
import GeoJSON from "ol/format/GeoJSON";
import { useQuery } from "@vue/apollo-composable";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import { Unicons } from "@/types";
import { useHeatMapDetailPopUp } from "@/components/maps/useHeatMapDetailPopUp";

const props = withDefaults(
  defineProps<{
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
  zoomToHotspot,
  hotspotZoomed,
} = useMaps();

const mapRef = ref<InstanceType<typeof OLMap.OlMap> | undefined>(undefined);
const currentZoom = ref(props.zoom);
const heatmapSource = shallowReactive(new VectorSource());
const view = ref<View | undefined>(undefined);
const contextMenuItems = ref<Item[]>([]);
const geoFilters = ref<AdvancedFilters | undefined>(undefined);
const { detailPopUp, setEntityDetailConfigurations, popUpDetailConfiguration } =
  useHeatMapDetailPopUp();
const getEntityQueryVariables = computed<GetEntityByIdQueryVariables>(() => {
  return {
    id: detailPopUp.entityId!,
    type: "",
  };
});

const { result: featureResult, loading: featureLoading } =
  useQuery<GetEntityByIdQuery>(
    GetEntityByIdDocument,
    getEntityQueryVariables,
    () => ({
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "no-cache",
      enabled: !!detailPopUp.entityId,
    }),
  );

contextMenuItems.value = [
  {
    text: t("map.center-map"),
    callback: (val) => {
      view.value?.setCenter(val.coordinate);
    },
  },
  "-",
];

const calculatedGridSize = computed(() => {
  const z = currentZoom.value;

  if (z >= 18) return 5;
  if (z >= 16) return 20;
  if (z >= 14) return 100;
  if (z >= 12) return 500;
  if (z >= 10) return 1000;
  return 5000;
});

const clearAndAddFeatures = (features: Feature[]) => {
  heatmapSource.clear();
  heatmapSource.addFeatures(features);
  zoomToHotspot(mapRef.value?.map, heatmapSource);
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

  currentZoom.value = map.getView().getZoom() ?? currentZoom.value;

  const geojsonPolygon = getGeojsonPolygonFromMap(map);
  if (!geoFilters.value) return;
  activateNewGeoFilter(props.filtersBaseApi, geoFilters.value, geojsonPolygon, calculatedGridSize.value);
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

const handleMapClick = (event: any) => {
  const map = mapRef.value?.map;
  if (!map || !hotspotZoomed.value) return;

  const feature = map.forEachFeatureAtPixel(event.pixel, (feat) => feat);
  if (!feature) return;
  detailPopUp.position = feature.getGeometry()?.getCoordinates();
  detailPopUp.entityId = feature.values_.id[0];
  if (detailPopUp.entityId) detailPopUp.isVisible = true;
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
    setEntityDetailConfigurations(newEntities);
  },
  { immediate: true },
);
</script>

<style scoped></style>
