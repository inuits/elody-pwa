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
    geoFilters: AdvancedFilters | undefined;
  }>(),
  {
    center: undefined,
    filtersBaseApi: undefined,
  },
);

const { t } = useI18n();
const {
  activateNewGeoFilter,
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
  return 35;
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
  if (!props.geoFilters) return;
  activateNewGeoFilter(props.filtersBaseApi, props.geoFilters, geojsonPolygon, calculatedGridSize.value);
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
