<template>
  <div class="mt-4">
    <Map.OlMap
      ref="map"
      style="width: 100%; height: 65vh; margin-top: 15px"
      projection="EPSG:3857"
      :loadTilesWhileAnimating="true"
      :loadTilesWhileInteracting="true"
    >
      <Map.OlView
        ref="view"
        :zoom="4"
        :center="[7963928.15, 5722324.97]"
        projection="EPSG:3857"
      />

      <Layers.OlTileLayer>
        <Sources.OlSourceOsm />
      </Layers.OlTileLayer>

      <Layers.OlVectorLayer>
        <Sources.OlSourceVector projection="EPSG:3857" :features="features">
        </Sources.OlSourceVector>
      </Layers.OlVectorLayer>
    </Map.OlMap>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Map, Layers, Sources } from "vue3-openlayers";
import { useMaps } from "@/composables/useMaps";

const props = defineProps<{
  wkt: string;
}>();

const { getWktFeature } = useMaps();

const features = computed(() => {
  return [getWktFeature(props.wkt)];
});
</script>
