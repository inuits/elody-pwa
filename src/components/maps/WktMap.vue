<template>
  <div>
    <Map.OlMap
      ref="mapRef"
      style="width: 100%; height: 65vh"
      :loadTilesWhileAnimating="true"
      :loadTilesWhileInteracting="true"
      @moveend="debouncedHandleMoveBoundingBox"
    >
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
import { computed, ref, watch, onUpdated, nextTick, onMounted, onUnmounted } from "vue";
import { Map, Layers, Sources } from "vue3-openlayers";
import { useMaps } from "@/composables/useMaps";
import { type Extent, extend } from "ol/extent";
import type View from "ol/View";
import { MapModes, MapViews, AdvancedFilters } from "@/generated-types/queries";
import { HeatMapItem } from "@/composables/useMaps";
import { FiltersBaseAPI } from "@/components/filters/FiltersBase.vue";
import debounce from "lodash.debounce";

const props = withDefaults(
  defineProps<{
    wkt: string[] | HeatMapItem[];
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

const viewRef = ref<{ view: View }>(null);
const mapRef = ref<InstanceType<typeof Map.OlMap> | undefined>(undefined);
const localCenter = ref<number[]>([]);
const activeProjection = computed(() => {
  return props.mapView === MapViews.Standard ? "EPSG:3857" : "EPSG:4326";
});

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
  const existedFeatures = wkt.value.length ? wkt.value : point.value ? [point.value] : [];
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

onMounted(async () => {
  const [lat = 0, long = 0] = props.center;
  localCenter.value = [lat, long];
  focusOnFeatures();
});
</script>
