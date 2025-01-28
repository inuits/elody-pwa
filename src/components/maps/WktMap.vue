<template>
  <div>
    <Map.OlMap
      ref="map"
      style="width: 100%; height: 65vh"
      :projection="projection"
      :loadTilesWhileAnimating="true"
      :loadTilesWhileInteracting="true"
    >
      <Map.OlView
        ref="view"
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
import { computed, ref } from "vue";
import { Map, Layers, Sources } from "vue3-openlayers";
import { useMaps } from "@/composables/useMaps";

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

const projection = ref<string>("EPSG:3857")

const mapCenter = computed(() => {
  const [lat = 0, long = 0] = props.center;
  return geoToMercator(lat, long);
});

const features = computed(() => {
  if (!props.wkt || props.wkt.length === 0) return [];
  return props.wkt.map(getWktFeature);
});
</script>
