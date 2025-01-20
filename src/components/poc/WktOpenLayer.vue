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
        :zoom="5"
        :center="[4446952.390346387, 2956840.258814348]"
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
  if (!props.wkt) return [];
  return [getWktFeature(props.wkt)];
});
</script>
