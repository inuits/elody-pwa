<template>
  <div class="relative">
    <OLMap.OlMap
      ref="mapRef"
      :pixelRatio="1"
      :loadTilesWhileAnimating="false"
      :loadTilesWhileInteracting="false"
      style="height: 65vh"
      @moveend="debouncedHandleMoveBoundingBox"
      @pointermove="throttledPointerMove"
      @singleclick="handleMapClick"
    >
      <OLMap.OlOverlay
        v-if="detailPopUp.isVisible && popUpDetailConfiguration"
        :position="detailPopUp.position"
        :offset="[0, -15]"
        positioning="bottom-center"
        :autoPan="true"
        :autoPanAnimation="{ duration: 250 }"
      >
        <div class="bg-white rounded shadow-lg p-3 text-sm w-48 relative">
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
          <div v-else class="p-2">
            <div class="flex justify-end">
              <button @click="detailPopUp.isVisible = false">✕</button>
            </div>
            <p class="font-bold text-center">Cluster Area</p>
            <p class="text-center">Zoom in to see details</p>
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
        :updateWhileAnimating="false"
        :updateWhileInteracting="false"
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
  shallowRef,
  markRaw,
  onMounted,
  onBeforeUnmount,
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
import { Point } from "ol/geom";
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
  bucketEntities,
  handlePointerMove,
  zoomToHotspot,
  hotspotZoomed,
} = useMaps();

const mapRef = shallowRef<any>(undefined);
const heatmapSource = shallowRef(markRaw(new VectorSource()));
const view = shallowRef<View | undefined>(undefined);
const currentZoom = ref(props.zoom);

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

const updateHeatmapWithBuckets = (newEntities: Entity[]) => {
  if (!newEntities || newEntities.length === 0) {
    heatmapSource.value.clear();
    return;
  }

  const buckets = bucketEntities(newEntities, calculatedGridSize.value);
  console.log(
    `Bucketing ${newEntities.length} entities into ${buckets.length} buckets`,
  );
  console.log(buckets);

  const features = buckets.map((bucket) => {
    const geometry = new Point([bucket.x, bucket.y]);
    const feature = new Feature({
      geometry: geometry,
      weight: bucket.weight,
    });

    feature.set("bucket_data", bucket);
    feature.setId(bucket.id);
    return feature;
  });

  requestAnimationFrame(() => {
    heatmapSource.value.clear();
    heatmapSource.value.addFeatures(features);
  });
};

const isMapBusy = () => {
  const map = mapRef.value?.map;
  if (!map) return false;
  const v = map.getView();
  return v.getAnimating() || v.getInteracting();
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
  if (isMapBusy()) return;
  handleMoveBoundingBox();

  const map = mapRef.value?.map;
  if (map) {
    const newZoom = map.getView().getZoom();
    if (newZoom && Math.abs(newZoom - currentZoom.value) > 0.5) {
      currentZoom.value = newZoom;
    }
  }
}, 1000);

const throttledPointerMove = (event) => {
  if (isMapBusy()) return;
  handlePointerMove(event, mapRef.value);
};

const handleMapClick = (event: any) => {
  const map = mapRef.value?.map;
  if (!map || isMapBusy()) return;

  const feature = map.forEachFeatureAtPixel(
    event.pixel,
    (feat: Feature) => feat,
    { hitTolerance: 5 }, // Easier clicking
  );

  if (!feature) {
    detailPopUp.isVisible = false;
    return;
  }

  const bucket = feature.get("bucket_data");

  if (bucket) {

    if (bucket.ids.length === 1) {
      detailPopUp.entityId = bucket.ids[0];
      detailPopUp.position = feature.getGeometry()?.getCoordinates();
      detailPopUp.isVisible = true;
    } else {
      const v = map.getView();
      if (v.getZoom() < 18) {
        v.animate({
          center: feature.getGeometry().getCoordinates(),
          zoom: v.getZoom() + 2,
          duration: 300,
        });
      } else {
        detailPopUp.entityId = bucket.ids[0];
        detailPopUp.position = feature.getGeometry()?.getCoordinates();
        detailPopUp.isVisible = true;
      }
    }
  }
};

const addViewToMap = () => {
  view.value = markRaw(
    new View({
      center: props.center,
      zoom: props.zoom,
    }),
  );
  mapRef.value?.map.setView(view.value);
};

const initializeHeatmap = async () => {
  geoFilters.value = await fetchGeoFilter();
  handleMoveBoundingBox();
};

onBeforeMount(async () => await initializeHeatmap());
onMounted(() => addViewToMap());
onBeforeUnmount(() => {
  if (!props.filtersBaseApi) return;
  Object.values(geoFilters.value || {})?.forEach(
    (advancedFilter: AdvancedFilter) => {
      props.filtersBaseApi.removeFilterFromList(advancedFilter.key);
    },
  );
});

watch(
  () => props.entities,
  async (newEntities) => {
    if (props.entitiesLoading) return;

    updateHeatmapWithBuckets(newEntities);
    setEntityDetailConfigurations(newEntities);
  },
  { immediate: true },
);

watch(calculatedGridSize, () => {
  if (props.entities && props.entities.length > 0) {
    updateHeatmapWithBuckets(props.entities);
  }
});
</script>
