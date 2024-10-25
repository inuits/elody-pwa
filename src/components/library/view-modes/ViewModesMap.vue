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
    <ol-mouseposition-control />

  </ol-map>
</template>


<script setup lang="ts">

import type { Entity } from "@/generated-types/queries";
import { ref, computed } from "vue";
import { type View, type Item } from "vue3-openlayers";
import { Feature } from 'ol';
import { Point } from 'ol/geom';
import { Style, Circle, Fill, Stroke } from 'ol/style';


defineProps<{
  entities: Entity[];
  entitiesLoading: boolean;
}>();

let vectorData = ref<[]>([]);

// Map properties
const zoom = ref(13);
const center = ref([414540.728945848, 6630846.409094376]);
const contextMenuItems = ref<Item[]>([]);
const view = ref<View | null>(null);
const blur = ref(20);
const radius = ref(20);
const projection = ref("EPSG:3857");

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



const features = computed(() => vectorData.value.map((vector) => {
  console.log("This is the vector:")
  console.log(vector)
    const feature = new Feature({
      geometry: new Point(geoToMercator(vector.longitude, vector.latitude))
    });
    const style = new Style({
      image: new Circle({
        radius: vector.severity,
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
  })
);


function geoToMercator(lon, lat) {
  var r_major = 6378137.000;
  var x = r_major * (lon * Math.PI / 180);
  var scale = x / lon;
  var y = 180.0 / Math.PI * Math.log(Math.tan(Math.PI / 4.0 + lat * (Math.PI / 180.0) / 2.0)) * scale;
  return [x, y];
}

vectorData.value = [
  {"id": 1, "latitude": 51.0543, "longitude": 3.7174, "severity": 3},
  {"id": 2, "latitude": 51.0545, "longitude": 3.7175, "severity": 7},
  {"id": 3, "latitude": 51.0547, "longitude": 3.7176, "severity": 5},
  {"id": 4, "latitude": 51.0549, "longitude": 3.7177, "severity": 2},
  {"id": 5, "latitude": 51.0551, "longitude": 3.7178, "severity": 8},
  {"id": 6, "latitude": 51.0553, "longitude": 3.7179, "severity": 4},
  {"id": 7, "latitude": 51.0555, "longitude": 3.7180, "severity": 6},
  {"id": 8, "latitude": 51.0557, "longitude": 3.7181, "severity": 9},
  {"id": 9, "latitude": 51.0559, "longitude": 3.7182, "severity": 1},
  {"id": 10, "latitude": 51.0561, "longitude": 3.7183, "severity": 10},
  {"id": 11, "latitude": 51.0563, "longitude": 3.7184, "severity": 3},
  {"id": 12, "latitude": 51.0565, "longitude": 3.7185, "severity": 7},
  {"id": 13, "latitude": 51.0567, "longitude": 3.7186, "severity": 5},
  {"id": 14, "latitude": 51.0569, "longitude": 3.7187, "severity": 2},
  {"id": 15, "latitude": 51.0571, "longitude": 3.7188, "severity": 8},
  {"id": 16, "latitude": 51.0573, "longitude": 3.7189, "severity": 4},
  {"id": 17, "latitude": 51.0575, "longitude": 3.7190, "severity": 6},
  {"id": 18, "latitude": 51.0577, "longitude": 3.7191, "severity": 9},
  {"id": 19, "latitude": 51.0579, "longitude": 3.7192, "severity": 1},
  {"id": 20, "latitude": 51.0581, "longitude": 3.7193, "severity": 10},
  {"id": 21, "latitude": 51.0583, "longitude": 3.7194, "severity": 3},
  {"id": 22, "latitude": 51.0585, "longitude": 3.7195, "severity": 7},
  {"id": 23, "latitude": 51.0587, "longitude": 3.7196, "severity": 5},
  {"id": 24, "latitude": 51.0589, "longitude": 3.7197, "severity": 2},
  {"id": 25, "latitude": 51.0591, "longitude": 3.7198, "severity": 8},
  {"id": 26, "latitude": 51.0593, "longitude": 3.7199, "severity": 4},
  {"id": 27, "latitude": 51.0595, "longitude": 3.7200, "severity": 6},
  {"id": 28, "latitude": 51.0597, "longitude": 3.7201, "severity": 9},
  {"id": 29, "latitude": 51.0599, "longitude": 3.7202, "severity": 1},
  {"id": 30, "latitude": 51.0601, "longitude": 3.7203, "severity": 10},
  {"id": 31, "latitude": 51.0603, "longitude": 3.7204, "severity": 3},
  {"id": 32, "latitude": 51.0605, "longitude": 3.7205, "severity": 7},
  {"id": 33, "latitude": 51.0607, "longitude": 3.7206, "severity": 5},
  {"id": 34, "latitude": 51.0609, "longitude": 3.7207, "severity": 2},
  {"id": 35, "latitude": 51.0611, "longitude": 3.7208, "severity": 8},
  {"id": 36, "latitude": 51.0613, "longitude": 3.7209, "severity": 4},
  {"id": 37, "latitude": 51.0615, "longitude": 3.7210, "severity": 6},
  {"id": 38, "latitude": 51.0617, "longitude": 3.7211, "severity": 9},
  {"id": 39, "latitude": 51.0619, "longitude": 3.7212, "severity": 1},
  {"id": 40, "latitude": 51.0621, "longitude": 3.7213, "severity": 10},
  {"id": 41, "latitude": 51.0623, "longitude": 3.7214, "severity": 3},
  {"id": 42, "latitude": 51.0625, "longitude": 3.7215, "severity": 7},
  {"id": 43, "latitude": 51.0627, "longitude": 3.7216, "severity": 5},
  {"id": 44, "latitude": 51.0629, "longitude": 3.7217, "severity": 2},
  {"id": 45, "latitude": 51.0631, "longitude": 3.7218, "severity": 8},
  {"id": 46, "latitude": 51.0633, "longitude": 3.7219, "severity": 4},
  {"id": 47, "latitude": 51.0635, "longitude": 3.7220, "severity": 6},
  {"id": 48, "latitude": 51.0637, "longitude": 3.7221, "severity": 9},
  {"id": 49, "latitude": 51.0639, "longitude": 3.7222, "severity": 1},
  {"id": 50, "latitude": 51.0641, "longitude": 3.7223, "severity": 10},
  {"id": 51, "latitude": 51.0643, "longitude": 3.7224, "severity": 3},
  {"id": 52, "latitude": 51.0645, "longitude": 3.7225, "severity": 7},
  {"id": 53, "latitude": 51.0647, "longitude": 3.7226, "severity": 5},
  {"id": 54, "latitude": 51.0649, "longitude": 3.7227, "severity": 2},
  {"id": 55, "latitude": 51.0651, "longitude": 3.7228, "severity": 8},
  {"id": 56, "latitude": 51.0653, "longitude": 3.7229, "severity": 4},
  {"id": 57, "latitude": 51.0655, "longitude": 3.7230, "severity": 6},
  {"id": 58, "latitude": 51.0657, "longitude": 3.7231, "severity": 9},
  {"id": 59, "latitude": 51.0659, "longitude": 3.7232, "severity": 1},
  {"id": 60, "latitude": 51.0661, "longitude": 3.7233, "severity": 10},
  {"id": 61, "latitude": 51.0663, "longitude": 3.7234, "severity": 3},
  {"id": 62, "latitude": 51.0665, "longitude": 3.7235, "severity": 7},
  {"id": 63, "latitude": 51.0667, "longitude": 3.7236, "severity": 5},
  {"id": 64, "latitude": 51.0669, "longitude": 3.7237, "severity": 2},
  {"id": 65, "latitude": 51.0671, "longitude": 3.7238, "severity": 8},
  {"id": 66, "latitude": 51.0673, "longitude": 3.7239, "severity": 4},
  {"id": 67, "latitude": 51.0675, "longitude": 3.7240, "severity": 6},
  {"id": 68, "latitude": 51.0677, "longitude": 3.7241, "severity": 9},
  {"id": 69, "latitude": 51.0679, "longitude": 3.7242, "severity": 1},
  {"id": 70, "latitude": 51.0681, "longitude": 3.7243, "severity": 10},
  {"id": 71, "latitude": 51.0683, "longitude": 3.7244, "severity": 3},
  {"id": 72, "latitude": 51.0685, "longitude": 3.7245, "severity": 7},
  {"id": 73, "latitude": 51.0687, "longitude": 3.7246, "severity": 5},
  {"id": 74, "latitude": 51.0689, "longitude": 3.7247, "severity": 2},
  {"id": 75, "latitude": 51.0691, "longitude": 3.7248, "severity": 8},
  {"id": 76, "latitude": 51.0693, "longitude": 3.7249, "severity": 4},
  {"id": 77, "latitude": 51.0695, "longitude": 3.7250, "severity": 6},
  {"id": 78, "latitude": 51.0697, "longitude": 3.7251, "severity": 9},
  {"id": 79, "latitude": 51.0699, "longitude": 3.7252, "severity": 1},
  {"id": 80, "latitude": 51.0701, "longitude": 3.7253, "severity": 10},
  {"id": 81, "latitude": 51.0703, "longitude": 3.7254, "severity": 3},
  {"id": 82, "latitude": 51.0705, "longitude": 3.7255, "severity": 7},
  {"id": 83, "latitude": 51.0707, "longitude": 3.7256, "severity": 5},
  {"id": 84, "latitude": 51.0709, "longitude": 3.7257, "severity": 2},
  {"id": 85, "latitude": 51.0711, "longitude": 3.7258, "severity": 8},
  {"id": 86, "latitude": 51.0713, "longitude": 3.7259, "severity": 4},
  {"id": 87, "latitude": 51.0715, "longitude": 3.7260, "severity": 6},
  {"id": 88, "latitude": 51.0717, "longitude": 3.7261, "severity": 9},
  {"id": 89, "latitude": 51.0719, "longitude": 3.7262, "severity": 1},
  {"id": 90, "latitude": 51.0721, "longitude": 3.7263, "severity": 10},
  {"id": 91, "latitude": 51.0723, "longitude": 3.7264, "severity": 3},
  {"id": 92, "latitude": 51.0725, "longitude": 3.7265, "severity": 7},
  {"id": 93, "latitude": 51.0727, "longitude": 3.7266, "severity": 5},
  {"id": 94, "latitude": 51.0729, "longitude": 3.7267, "severity": 2},
  {"id": 95, "latitude": 51.0731, "longitude": 3.7268, "severity": 8},
  {"id": 96, "latitude": 51.0733, "longitude": 3.7269, "severity": 4},
  {"id": 97, "latitude": 51.0735, "longitude": 3.7270, "severity": 6},
  {"id": 98, "latitude": 51.0737, "longitude": 3.7271, "severity": 9},
  {"id": 99, "latitude": 51.0739, "longitude": 3.7272, "severity": 1},
  {"id": 100, "latitude": 51.0741, "longitude": 3.7273, "severity": 10}
];
</script>



<style scoped>
</style>