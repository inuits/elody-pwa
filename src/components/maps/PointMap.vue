<template>
  <div class="relative">
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
              >Open in other tab</router-link>
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

      <Layers.OlVectorLayer v-if="clustering" :style="clusterStyle">
        <Sources.OlSourceCluster :distance="40">
          <Sources.OlSourceVector
            ref="vectorSourceRef"
            :features="pointFeatures"
            :projection="activeProjection"
          />
        </Sources.OlSourceCluster>
      </Layers.OlVectorLayer>

      <Layers.OlVectorLayer v-else>
        <Sources.OlSourceVector
          ref="vectorSourceRef"
          :features="pointFeatures"
          :projection="activeProjection"
        />
      </Layers.OlVectorLayer>

      <MapControls.OlFullscreenControl />
    </Map.OlMap>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from "vue";
import { Map, Layers, Sources, MapControls } from "vue3-openlayers";
import { Style, Icon, Fill, Stroke, Circle as CircleStyle, Text } from "ol/style";
import { extend, type Extent } from "ol/extent";
import type View from "ol/View";
import debounce from "lodash.debounce";
import { useMaps } from "@/composables/useMaps";
import { useHeatMapDetailPopUp } from "@/components/maps/useHeatMapDetailPopUp";
import { useQuery } from "@vue/apollo-composable";
import { useI18n } from "vue-i18n";
import { Unicons } from "@/types";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import {
  MapViews,
  type AdvancedFilters,
  type Entity,
  GetEntityByIdDocument,
  type GetEntityByIdQuery,
  type GetEntityByIdQueryVariables,
} from "@/generated-types/queries";
import type { FiltersBaseAPI } from "@/components/filters/FiltersBase.vue";

interface PointItem {
  id: string;
  lat: number;
  lon: number;
}

const props = withDefaults(
  defineProps<{
    points: PointItem[];
    entities: Entity[];
    center?: number[];
    mapView?: MapViews;
    filtersBaseApi?: FiltersBaseAPI;
    useFilters?: boolean;
    geoFilters?: AdvancedFilters;
    clustering?: boolean;
  }>(),
  {
    center: () => [],
    mapView: MapViews.Satellite,
    useFilters: false,
    geoFilters: undefined,
    clustering: false,
  },
);

const {
  createPointFeature,
  activateNewGeoFilter,
  getGeojsonPolygonFromMap,
} = useMaps();

const { t } = useI18n();
const { detailPopUp, setEntityDetailConfigurations, popUpDetailConfiguration } =
  useHeatMapDetailPopUp();

const mapRef = ref<InstanceType<typeof Map.OlMap> | undefined>(undefined);
const viewRef = ref<{ view: View } | null>(null);
const vectorSourceRef = ref<{ source: any } | null>(null);
const localCenter = ref<number[]>([]);

const activeProjection = computed(() =>
  props.mapView === MapViews.Standard ? "EPSG:3857" : "EPSG:4326",
);

const pointFeatures = computed(() =>
  props.points.map((p) =>
    createPointFeature(p.lat, p.lon, p.id, activeProjection.value),
  ),
);

const getEntityQueryVariables = computed<GetEntityByIdQueryVariables>(() => ({
  id: detailPopUp.entityId!,
  type: "",
}));

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

const markerStyle = new Style({
  image: new Icon({ anchor: [0.5, 1], src: "/marker.png", scale: 0.075 }),
});

const clusterStyleCache: Record<number, Style> = {};

const clusterStyle = (feature: any) => {
  const clusterFeatures = feature.get("features");
  const size = clusterFeatures?.length ?? 0;

  if (size <= 1) return markerStyle;

  if (!clusterStyleCache[size]) {
    clusterStyleCache[size] = new Style({
      image: new CircleStyle({
        radius: 16,
        fill: new Fill({ color: "#3b82f6" }),
        stroke: new Stroke({ color: "#ffffff", width: 2 }),
      }),
      text: new Text({
        text: String(size),
        fill: new Fill({ color: "#ffffff" }),
        font: "bold 12px Arial",
      }),
    });
  }
  return clusterStyleCache[size];
};

const focusOnFeatures = async () => {
  if (!pointFeatures.value.length || !viewRef.value) return;
  await nextTick();
  const source = vectorSourceRef.value?.source;
  if (!source) return;
  const extent = source.getExtent() as Extent;
  if (extent && isFinite(extent[0])) {
    viewRef.value.view.fit(extent, { padding: [50, 50, 50, 50], duration: 1000 });
  }
};

const handleMapClick = (event: any) => {
  const map = mapRef.value?.map;
  if (!map) return;
  const feature = map.forEachFeatureAtPixel(event.pixel, (feat: any) => feat);
  if (!feature) return;

  if (props.clustering) {
    const clusterFeatures = feature.get("features");
    if (!clusterFeatures?.length) return;
    if (clusterFeatures.length === 1) {
      detailPopUp.position = event.coordinate;
      detailPopUp.entityId = clusterFeatures[0].getId();
      if (detailPopUp.entityId) detailPopUp.isVisible = true;
    } else {
      const view = mapRef.value?.map?.getView();
      if (!view) return;
      const extent: Extent = clusterFeatures.reduce(
        (acc: Extent | null, f: any) => {
          const geomExtent = f.getGeometry()?.getExtent() as Extent | undefined;
          if (!geomExtent) return acc;
          return acc ? extend(acc, geomExtent) : geomExtent;
        },
        null,
      );
      if (extent) view.fit(extent, { padding: [50, 50, 50, 50], duration: 500 });
    }
  } else {
    detailPopUp.position = event.coordinate;
    detailPopUp.entityId = feature.getId() as string;
    if (detailPopUp.entityId) detailPopUp.isVisible = true;
  }
};

const handleMoveBoundingBox = () => {
  if (!props.filtersBaseApi) return;
  const map = mapRef.value?.map;
  if (!map) return;
  const geojsonPolygon = getGeojsonPolygonFromMap(map, activeProjection.value);
  if (!props.geoFilters) return;
  activateNewGeoFilter(props.filtersBaseApi, props.geoFilters, geojsonPolygon);
};

const debouncedHandleMoveBoundingBox = debounce(() => {
  if (!props.useFilters) return;
  handleMoveBoundingBox();
}, 1000);

onMounted(() => {
  const [lat = 0, long = 0] = props.center;
  localCenter.value = [lat, long];
  focusOnFeatures();
});

onUnmounted(() => {
  debouncedHandleMoveBoundingBox.cancel();
});

watch(
  () => props.entities,
  (newEntities) => {
    if (!newEntities?.length) return;
    setEntityDetailConfigurations(newEntities);
  },
  { immediate: true },
);
</script>

<style scoped></style>
