<template>
  <div>
    <Map.OlMap
      ref="mapRef"
      style="width: 100%; height: 65vh"
      :loadTilesWhileAnimating="true"
      :loadTilesWhileInteracting="true"
      @moveend="debouncedHandleMoveBoundingBox"
      @singleclick="handleMapClick"
    >
      <Map.OlOverlay
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
                <div>
                  <p class="font-bold">{{ t(item.label) }}</p>
                  <p>{{ featureResult.Entity.intialValues[item.key] || "-" }}</p>
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
      </Map.OlOverlay>

      <Map.OlView
        ref="viewRef"
        :zoom="7"
        :maxZoom="17"
        :center="localCenter"
        :projection="activeProjection"
      />

      <Layers.OlTileLayer>
        <Sources.OlSourceOsm v-if="mapView === MapViews.Standard" />
        <Sources.OlSourceXyz
          v-if="mapView === MapViews.Satellite"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          :attributions="[
            'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
          ]"
        />
      </Layers.OlTileLayer>

      <Layers.OlVectorLayer>
        <Sources.OlSourceVector
          :projection="activeProjection"
          :features="features"
        >
        </Sources.OlSourceVector>
      </Layers.OlVectorLayer>
    </Map.OlMap>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted } from "vue";
import { Map, Layers, Sources } from "vue3-openlayers";
import { useMaps } from "@/composables/useMaps";
import { type Extent, extend } from "ol/extent";
import type View from "ol/View";
import {
  MapModes,
  MapViews,
  AdvancedFilters,
  Entity,
  GetEntityByIdDocument,
  type GetEntityByIdQuery,
  type GetEntityByIdQueryVariables,
} from "@/generated-types/queries";
import { HeatMapItem } from "@/composables/useMaps";
import { FiltersBaseAPI } from "@/components/filters/FiltersBase.vue";
import debounce from "lodash.debounce";
import { useHeatMapDetailPopUp } from "@/components/maps/useHeatMapDetailPopUp";
import { useQuery } from "@vue/apollo-composable";
import { Unicons } from "@/types";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import { useI18n } from "vue-i18n";

const props = withDefaults(
  defineProps<{
    wkt: string[] | HeatMapItem[];
    entities: Entity[];
    center?: number[];
    mapView?: MapViews;
    mapMode?: MapModes;
    filtersBaseApi?: FiltersBaseAPI;
    useFilters: boolean;
    geoFilters: AdvancedFilters | undefined;
  }>(),
  {
    center: () => [],
    mapView: MapViews.Satellite,
    mapMode: MapModes.Default,
    useFilters: false,
  },
);

const {
  getMarkerFeature,
  transformDataToWktFeatures,
  activateNewGeoFilter,
  getGeojsonPolygonFromMap,
} = useMaps();

const { t } = useI18n();
const { detailPopUp, setEntityDetailConfigurations, popUpDetailConfiguration } =
  useHeatMapDetailPopUp();

const viewRef = ref<{ view: View }>(null);
const mapRef = ref<InstanceType<typeof Map.OlMap> | undefined>(undefined);
const localCenter = ref<number[]>([]);
const activeProjection = computed(() => {
  return props.mapView === MapViews.Standard ? "EPSG:3857" : "EPSG:4326";
});

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

const point = computed(() => {
  if (props.mapView === MapViews.Standard) {
    return null;
  }
  const [lat, long] = props.center;
  return getMarkerFeature(lat, long, activeProjection.value);
});

const wkt = computed(() => {
  if ((!props.wkt || props.wkt.length === 0) && !point.value) return [];

  return transformDataToWktFeatures(
    props.wkt,
    props.mapMode === MapModes.HeatMode,
    activeProjection.value,
  );
});

const features = computed(() => {
  return [...wkt.value, point.value].filter((feature) => !!feature);
});

const focusOnFeatures = async () => {
  const existedFeatures = wkt.value.length
    ? wkt.value
    : point.value
      ? [point.value]
      : [];
  if (existedFeatures.length > 0 && viewRef.value) {
    await nextTick();
    const extent: Extent = existedFeatures.reduce((acc, feature) => {
      if (!feature) return acc;
      const featureExtent = feature.getGeometry()?.getExtent() as Extent;
      return acc ? extend(acc, featureExtent) : featureExtent;
    }, null);

    if (extent) {
      viewRef.value.view.fit(extent, {
        padding: [50, 50, 50, 50],
        duration: 1000,
      });
    }
  }
};

const handleMoveBoundingBox = () => {
  if (!props.filtersBaseApi) return;
  const map = mapRef.value?.map;
  if (!map) return;

  const geojsonPolygon = getGeojsonPolygonFromMap(map);
  if (!props.geoFilters) return;
  activateNewGeoFilter(props.filtersBaseApi, props.geoFilters, geojsonPolygon);
};

const debouncedHandleMoveBoundingBox = debounce(() => {
  if (!props.useFilters) return;
  handleMoveBoundingBox();
}, 1000);

const handleMapClick = (event: any) => {
  const map = mapRef.value?.map;
  if (!map) return;

  const feature = map.forEachFeatureAtPixel(event.pixel, (feat) => feat);
  if (!feature) return;
  detailPopUp.position = feature.getGeometry()?.getCoordinates()?.[0][0];
  detailPopUp.entityId = feature.id_;
  if (detailPopUp.entityId) detailPopUp.isVisible = true;
};

onMounted(async () => {
  const [lat = 0, long = 0] = props.center;
  localCenter.value = [lat, long];
  focusOnFeatures();
});

watch(
  () => props.entities,
  async (newEntities) => {
    if (!newEntities?.length) return;
    setEntityDetailConfigurations(newEntities);
  },
  { immediate: true },
);
</script>
