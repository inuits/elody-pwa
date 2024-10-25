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
import { Style, Circle, Fill, Stroke } from 'ol/style';

const props = defineProps<{
  entities: Entity[];
  entitiesLoading: boolean;
}>();

const { entities } = toRefs(props);

const zoom = ref(13);
const center = ref([414540.728945848, 6630846.409094376]);
const contextMenuItems = ref<Item[]>([]);
const view = ref<View | null>(null);
const blur = ref(20);
const radius = ref(20);

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

const features = computed(() => entities.value?.map((entity) => {
  const [longitude, latitude] = entity.intialValues.location.split(",")
  const feature = new Feature({
    geometry: new Point(geoToMercator(longitude, latitude))
  });
  const style = new Style({
    image: new Circle({
      radius: entity.intialValues.damageSeverity,
      fill: new Fill({
        color: 'rgba(255, 0, 0, 0.5)'
      }),
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 1)',
        width: 1
      })
    })
  });
  feature.setStyle(style);
  return feature;
}));

function geoToMercator(lat, lon) {
  var r_major = 6378137.000;
  var x = r_major * (lon * Math.PI / 180);
  var scale = x / lon;
  var y = 180.0 / Math.PI * Math.log(Math.tan(Math.PI / 4.0 + lat * (Math.PI / 180.0) / 2.0)) * scale;
  return [x, y];
}

</script>

<style scoped>
</style>