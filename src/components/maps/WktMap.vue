<template>
  <div>
    <Map.OlMap
      style="width: 100%; height: 65vh"
      :loadTilesWhileAnimating="true"
      :loadTilesWhileInteracting="true"
    >
      <Map.OlView
        ref="viewRef"
        :zoom="7"
        :maxZoom="17"
        :center="mapCenter"
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
        <Sources.OlSourceVector :projection="activeProjection" :features="features">
        </Sources.OlSourceVector>
      </Layers.OlVectorLayer>
    </Map.OlMap>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUpdated, nextTick } from "vue";
import { Map, Layers, Sources } from "vue3-openlayers";
import { useMaps } from "@/composables/useMaps";
import { type Extent, extend } from "ol/extent";
import type View from "ol/View";
import { fromLonLat } from "ol/proj"; // Import transformation helper
import { MapModes, MapViews } from "@/generated-types/queries";
import { HeatMapItem } from "@/composables/useMaps";

const props = withDefaults(
  defineProps<{
    wkt: string[] | HeatMapItem[];
    center?: number[];
    mapView?: MapViews;
    mapMode?: MapModes;
  }>(),
  {
    center: () => [],
    mapView: MapViews.Satellite,
    mapMode: MapModes.Default,
  },
);

const { getMarkerFeature, transformDataToWktFeatures } = useMaps();

const viewRef = ref<{ view: View }>(null);

const activeProjection = computed(() => {
  return props.mapView === MapViews.Standard ? "EPSG:3857" : "EPSG:4326";
});

const mapCenter = computed(() => {
  const [lat = 0, long = 0] = props.center;
  return [lat, long]; 
});

const point = computed(() => {
  const [lat, long] = props.center;
  return getMarkerFeature(lat, long, activeProjection.value);
});

const wkt = computed(() => {
  if ((!props.wkt || props.wkt.length === 0) && !point.value) return [];

  return transformDataToWktFeatures(
    props.wkt,
    props.mapMode === MapModes.HeatMode,
    activeProjection.value
  );
});

const features = computed(() => {
  return [...wkt.value, point.value];
});

const focusOnFeatures = async () => {
  const existedFeatures = wkt.value.length ? wkt.value : [point.value];
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

onUpdated(() => {
  focusOnFeatures();
});

watch(
  [features, viewRef],
  () => {
    focusOnFeatures();
  },
  { immediate: true, deep: true },
);
</script>