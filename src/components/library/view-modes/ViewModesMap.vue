<template>
  <form>
    <fieldset>
      <label for="blur">Blur</label>
      <input
        type="range"
        id="blur"
        min="0"
        max="100"
        step="1"
        v-model.number="blur"
      />
      <span class="description">{{ blur }}</span>
    </fieldset>
    <fieldset>
      <label for="radius">Radius</label>
      <input
        type="range"
        id="radius"
        min="0"
        max="100"
        step="1"
        v-model.number="radius"
      />
      <span class="description">{{ radius }}</span>
    </fieldset>
  </form>

  <ol-map
    ref="map"
    :loadTilesWhileAnimating="true"
    :loadTilesWhileInteracting="true"
    style="height: 75%"
  >
    <ol-view
      ref="view"
      :zoom="zoom"
      :center="center"
    />

    <ol-tile-layer>
      <ol-source-osm />
    </ol-tile-layer>

    <ol-heatmap-layer
      title="heatmap"
      :blur="blur"
      :radius="radius"
      :weight="heatmapWeight"
      :zIndex="1"
    >
      <ol-source-vector
        :features="features"
      />
    </ol-heatmap-layer>

    <ol-context-menu-control
      :items="contextMenuItems"
    />

    <ol-fullscreen-control />
  </ol-map>
</template>


<script setup lang="ts">

import type { Entity } from "@/generated-types/queries";
import { ref, computed, toRefs } from "vue";
import { type View, type Item } from "vue3-openlayers";
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { geoToMercator } from "@/helpers";

const props = defineProps<{
  entities: Entity[];
  entitiesLoading: boolean;
  center: String;
  zoom: number;
  blur: number;
  radius: number;
}>();

const view = ref<View | null>(null);
const contextMenuItems = ref<Item[]>([]);

const {
  entities,
  center,
  zoom,
  blur,
  radius
} = toRefs(props);

const features = computed(() => entities.value?.map((entity) => {
  const mapData = entity.mapComponent;
  if (!mapData) return new Feature();
  return new Feature({
    geometry: new Point(geoToMercator(mapData.coordinateX.value, mapData.coordinateY.value)),
    weight: mapData.weight.value
  });
}));

contextMenuItems.value = [
  {
    text: "Center map here",
    classname: "some-style-class",
    callback: (val) => {
      view.value?.setCenter(val.coordinate);
    },
  },
  "-",
];

const heatmapWeight = function (feature) {
  const weight = feature.get("weight");
  return weight / 100;
};
</script>

<style scoped>
</style>