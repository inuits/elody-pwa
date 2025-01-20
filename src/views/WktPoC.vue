<template>
  <div class="px-8">
    <BaseInputTextNumberDatetime
      v-model:model-value="wkt"
      type="textarea"
      input-style="default"
    />
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import { Map, Layers, Sources } from "vue3-openlayers";
import { useMaps } from "@/composables/useMaps";

const { getWktFeature } = useMaps();

const wkt = ref<string>("");

const features = computed(() => {
  if (!wkt.value) return [];
  return [getWktFeature(wkt.value)];
});
</script>
