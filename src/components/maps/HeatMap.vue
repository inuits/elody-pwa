<template>
  <Map.OlMap
    ref="map"
    v-if="entities && entities?.length >= 0"
    :loadTilesWhileAnimating="true"
    :loadTilesWhileInteracting="true"
    style="height: 65vh"
  >
    <Map.OlView
      ref="view"
      :zoom="getBasicMapProperties(config).zoom"
      :center="mapCenter"
    />

    <Layers.OlTileLayer>
      <Sources.OlSourceOsm />
    </Layers.OlTileLayer>

    <Layers.OlHeatmapLayer
      title="heatmap"
      :blur="getBasicMapProperties(config).blur"
      :radius="getBasicMapProperties(config).radius"
      :weight="heatmapWeight"
      :zIndex="1"
    >
      <Sources.OlSourceVector :features="heatmapPoints" />
    </Layers.OlHeatmapLayer>

    <MapControls.OlContextMenuControl :items="contextMenuItems" />

    <MapControls.OlFullscreenControl />
  </Map.OlMap>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, computed, toRefs } from "vue";
import {
  type View,
  type Item,
  Map,
  Layers,
  Sources,
  MapControls,
} from "vue3-openlayers";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { fromLonLat } from 'ol/proj';
import { useMaps } from "@/composables/useMaps";
import type { ConfigItem, Entity } from "@/generated-types/queries";
import { router } from "@/main";

const props = withDefaults(
  defineProps<{
    config: ConfigItem[];
    entities: Entity[] | undefined;
    center?: number[] | undefined;
  }>(),
  {
    center: undefined,
  },
);

const { t } = useI18n();
const { getBasicMapProperties } = useMaps();

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

const mapCenter = computed(() => {
  if (props.center !== undefined)
    return fromLonLat([props.center[1], props.center[0]]);
  const center = getBasicMapProperties(props.config).center;
  return fromLonLat([center[1], center[0]]);
});

const heatmapPoints = computed(() => {
  if (router.currentRoute.value.name === "SingleEntity") {
    const mapData = entities.value[0].entityView.column.elements.mapElement;
    if (!mapData) return new Feature();
    return [
      new Feature({
        geometry: new Point(fromLonLat([mapData.longitude?.value, mapData.latitude?.value])),
        weight: mapData.weight?.value,
      }),
    ];
  } else {
    return entities.value?.map((entity) => {
      if (!entity) return [];
      const mapData = entity.mapElement;
      if (!mapData) return new Feature();
      return new Feature({
        geometry: new Point(fromLonLat([mapData.longitude?.value, mapData.latitude?.value])),
        weight: mapData.weight?.value,
      });
    })
  }
});

const heatmapWeight = function (feature: Feature) {
  const weight = feature.get("weight");
  return weight / 100;
};
</script>

<style scoped></style>
