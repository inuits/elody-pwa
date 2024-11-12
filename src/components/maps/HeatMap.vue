<template>
  <ol-map
    ref="map"
    :loadTilesWhileAnimating="true"
    :loadTilesWhileInteracting="true"
    style="height: 65vh"
  >
    <ol-view
      ref="view"
      :zoom="getBasicMapProperties(config).zoom"
      :center="getBasicMapProperties(config).center"
    />

    <ol-tile-layer>
      <ol-source-osm />
    </ol-tile-layer>

    <ol-heatmap-layer
      title="heatmap"
      :blur="getBasicMapProperties(config).blur"
      :radius="getBasicMapProperties(config).radius"
      :weight="heatmapWeight"
      :zIndex="1"
    >
      <ol-source-vector :features="heatmapPoints" />
    </ol-heatmap-layer>

    <ol-context-menu-control :items="contextMenuItems" />

    <ol-fullscreen-control />
  </ol-map>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, computed, toRefs } from "vue";
import { type View, type Item } from "vue3-openlayers";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { useMaps } from "@/composables/useMaps";
import { ConfigItem, Entity } from "@/generated-types/queries";

const props = defineProps<{
  config: ConfigItem[];
  entities: Entity[];
}>();

const { t } = useI18n();
const { getBasicMapProperties, geoToMercator } = useMaps();

const { entities } = toRefs(props);
const view = ref<View | null>(null);
const contextMenuItems = ref<Item[]>([]);

contextMenuItems.value = [
  {
    text: t("map.center-map"),
    callback: (val) => {
      view.value?.setCenter(val.coordinate);
    },
  },
  "-",
];

const heatmapPoints = computed(() =>
  entities.value?.map((entity) => {
    const mapData = entity.mapComponent;
    if (!mapData) return new Feature();
    return new Feature({
      geometry: new Point(
        geoToMercator(mapData.coordinateX.value, mapData.coordinateY.value)
      ),
      weight: mapData.weight.value,
    });
  })
);

const heatmapWeight = function (feature: Feature) {
  const weight = feature.get("weight");
  return weight / 100;
};
</script>

<style scoped></style>
