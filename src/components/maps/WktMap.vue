<template>
  <div>
    <Map.OlMap
      style="width: 100%; height: 65vh"
      :projection="projection"
      :loadTilesWhileAnimating="true"
      :loadTilesWhileInteracting="true"
    >
      <Map.OlView
        ref="viewRef"
        :zoom="7"
        :center="mapCenter"
        :projection="projection"
      />

      <Layers.OlTileLayer>
        <Sources.OlSourceOsm />
      </Layers.OlTileLayer>

      <Layers.OlVectorLayer>
        <Sources.OlSourceVector :projection="projection" :features="features">
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

const props = withDefaults(
  defineProps<{
    wkt: string[];
    center?: number[];
  }>(),
  {
    center: () => [],
  },
);

const { getWktFeature, geoToMercator } = useMaps();

const viewRef = ref<{ view: View }>(null);
const projection = ref<string>("EPSG:4326");

const mapCenter = computed(() => {
  const [lat = 0, long = 0] = props.center;
  return geoToMercator(lat, long);
});

const point = computed(() => {
  const [point1, point2] = mapCenter.value;
  return getWktFeature(`POINT(${point1} ${point2})`);
});

const wkt = computed(() => {
  if ((!props.wkt || props.wkt.length === 0) && !point.value) return [];
  return [...props.wkt].map(getWktFeature);
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

    viewRef.value.view.fit(extent, {
      padding: [50, 50, 50, 50],
      duration: 1000,
    });
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
