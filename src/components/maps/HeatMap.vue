<template>
  <Map.OlMap
    ref="mapRef"
    v-if="entities && entities?.length >= 0"
    :loadTilesWhileAnimating="true"
    :loadTilesWhileInteracting="true"
    style="height: 65vh"
    @moveend="handleMoveEnd"
    @pointermove="handlePointerMove"
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
import { fromExtent } from "ol/geom/Polygon";
import GeoJSON from "ol/format/GeoJSON";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { fromLonLat } from "ol/proj";
import { useMaps } from "@/composables/useMaps";
import type { ConfigItem, Entity, MapElement } from "@/generated-types/queries";
import { useListItemHelper } from "@/composables/useListItemHelper";
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
const { setHoveredListItem } = useListItemHelper();
const { entities } = toRefs(props);

const mapRef = ref<InstanceType<typeof Map.OlMap> | null>(null);
const view = ref<View | null>(null);
const contextMenuItems = ref<Item[]>([]);
const hoveredFeature = ref<string | undefined>(undefined);

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

const createFeature = (mapData: MapElement, id: string): Feature => {
  return new Feature({
    geometry: new Point(
      fromLonLat([mapData.longitude?.value, mapData.latitude?.value]),
    ),
    weight: mapData.weight?.value,
    id: id,
  });
};

const heatmapPoints = computed(() => {
  if (router.currentRoute.value.name === "SingleEntity") {
    const mapData = entities.value[0].entityView.column.elements.mapElement;
    if (!mapData) return new Feature();
    return [createFeature(mapData, entities.value[0].id)];
  } else {
    return entities.value?.map((entity) => {
      if (!entity) return [];
      const mapData = entity.mapElement;
      if (!mapData) return new Feature();
      return createFeature(mapData, entity.id);
    });
  }
});

const heatmapWeight = function (feature: Feature) {
  const weight = feature.get("weight");
  return weight / 100;
};

const handleMoveEnd = () => {
  const map = mapRef.value?.map;
  if (map) {
    const extent = map.getView().calculateExtent(map.getSize());
    console.log("Bounding Box:", extent);

    const polygon = fromExtent(extent); // extent: [minX, minY, maxX, maxY]
    console.log("Polygon:", polygon);

    const polygon4326 = polygon.clone().transform("EPSG:3857", "EPSG:4326");
    console.log("Polygon in LAT/LONG:", polygon4326);

    const geojsonFormat = new GeoJSON();
    const geojsonPolygon = geojsonFormat.writeGeometryObject(polygon4326);
    console.log("geojsonPolygon:");
    console.log(JSON.stringify(geojsonPolygon, null, 2));
  }
};

const handlePointerMove = (event: Event) => {
  const feature = mapRef.value.forEachFeatureAtPixel(
    event.pixel,
    (feature) => feature,
  );
  if (feature) {
    hoveredFeature.value = feature.get("id");
  } else {
    hoveredFeature.value = undefined;
  }
  setHoveredListItem(hoveredFeature.value);
};
</script>

<style scoped></style>
