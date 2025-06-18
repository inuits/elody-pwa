<template>
  <OLMap.OlMap
    ref="mapRef"
    :loadTilesWhileAnimating="true"
    :loadTilesWhileInteracting="true"
    style="height: 65vh"
    @moveend="debouncedHandleMoveBoundingBox"
    @pointermove="handlePointerMove"
  >
    <Layers.OlTileLayer>
      <Sources.OlSourceOsm />
    </Layers.OlTileLayer>

    <Layers.OlHeatmapLayer
      title="heatmap"
      :source="heatmapSource"
      :blur="blur"
      :radius="radius"
      :weight="heatmapWeight"
      :zIndex="1"
    >
    </Layers.OlHeatmapLayer>

    <MapControls.OlContextMenuControl :items="contextMenuItems" />

    <MapControls.OlFullscreenControl />
  </OLMap.OlMap>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, onBeforeMount, watch, shallowReactive, onMounted, onBeforeUnmount } from "vue";
import debounce from 'lodash.debounce';
import {
  type Item,
  Map as OLMap,
  Layers,
  Sources,
  MapControls,
} from "vue3-openlayers";
import { fromExtent } from "ol/geom/Polygon";
import VectorSource from 'ol/source/Vector';
import GeoJSON from "ol/format/GeoJSON";
import View from 'ol/View';
import { Feature } from "ol";
import { Point } from "ol/geom";
import { fromLonLat } from "ol/proj";
import {
  type AdvancedFilters,
  type AdvancedFilter,
  type ConfigItem,
  type Entity,
  GetGeoFilterForMapDocument,
  type GetGeoFilterForMapQuery,
} from "@/generated-types/queries";
import { FiltersBaseAPI } from "@/components/filters/FiltersBase.vue";
import { useListItemHelper } from "@/composables/useListItemHelper";
import { apolloClient } from "@/main";

const props = withDefaults(
  defineProps<{
    config: ConfigItem[];
    entities: Object;
    entitiesLoading: boolean;
    center: number[];
    zoom: number;
    blur: number;
    radius: number;
    isEnabledInPreview: boolean;
    filtersBaseApi?: FiltersBaseAPI;
  }>(),
  {
    center: undefined,
    filtersBaseApi: undefined,
  },
);

const { t } = useI18n();
const { setHoveredListItem } = useListItemHelper();

const mapRef = ref<InstanceType<typeof OLMap.OlMap> | undefined>(undefined);
const heatmapSource = shallowReactive(new VectorSource());
const view = ref<View | undefined>(undefined);
const contextMenuItems = ref<Item[]>([]);
const hoveredFeature = ref<string | undefined>(undefined);
const geoFilter = ref<AdvancedFilters | undefined>(undefined);
const featureCache = new Map<string, Feature>();

contextMenuItems.value = [
  {
    text: t("map.center-map"),
    callback: (val) => {
      view.value?.setCenter(val.coordinate);
    },
  },
  "-",
];

function safeAddFeatures(features: Feature[]) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      heatmapSource.addFeatures(features);
    });
  } else {
    // Fallback for older browsers
    setTimeout(() => heatmapSource.addFeatures(features), 0);
  }
}

const updateHeatmapFeatures = (newEntities: Entity[]) => {
  const newIds = new Set<string>();
  const newFeatures: Feature[] = [];

  for (const entity of newEntities) {
    const id = entity.id;
    newIds.add(id);
    const mapData = entity.mapElement;
    if (!mapData || !mapData.coordinates?.value) continue;

    const existingFeature = featureCache.get(id);
    const newCoords = fromLonLat([
      mapData.coordinates.value[0],
      mapData.coordinates.value[1],
    ]);
    const newWeight = mapData.weight?.value ?? 10;

    if (existingFeature) {
      const existingGeom = existingFeature.getGeometry() as Point;
      const [x, y] = existingGeom.getCoordinates();
      const [nx, ny] = newCoords;

      const weightChanged = existingFeature.get("weight") !== newWeight;
      const coordsChanged = x !== nx || y !== ny;
      if (coordsChanged) existingFeature.setGeometry(new Point(newCoords));
      if (weightChanged) existingFeature.set("weight", newWeight);
    } else {
      const newFeature = new Feature({
        geometry: new Point(newCoords),
        weight: newWeight,
        id: id,
      });
      featureCache.set(id, newFeature);
      newFeatures.push(newFeature);
    }
  }

  for (const [id, feature] of featureCache) {
    if (!newIds.has(id)) {
      heatmapSource.removeFeature(feature);
      featureCache.delete(id);
    }
  }

  if (newFeatures.length > 0)
    safeAddFeatures(newFeatures);
};

const heatmapWeight = function (feature: Feature) {
  const weight = feature.get("weight");
  return weight / 100;
};

const handleMoveBoundingBox = () => {
  if (!props.filtersBaseApi) return;
  const map = mapRef.value?.map;
  if (!map) return;

  const extent = map.getView().calculateExtent(map.getSize());
  const polygon = fromExtent(extent); // extent: [minX, minY, maxX, maxY]
  const polygon4326 = polygon.clone().transform("EPSG:3857", "EPSG:4326");
  const geojsonFormat = new GeoJSON();
  const geojsonPolygon = geojsonFormat.writeGeometryObject(polygon4326);
  if (!geoFilter.value) return;

  Object.values(geoFilter.value)?.forEach((advancedFilter: AdvancedFilter) => {
    props.filtersBaseApi.removeFilterFromList(advancedFilter.key);
  });
  props.filtersBaseApi.initializeAndActivateNewFilter(geoFilter.value, geojsonPolygon)
};

const debouncedHandleMoveBoundingBox = debounce(() => {
  handleMoveBoundingBox();
}, 1000);

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

const fetchGeoFilter = async () => {
  await apolloClient
    .query<GetGeoFilterForMapQuery>({
      query: GetGeoFilterForMapDocument,
      fetchPolicy: "no-cache",
    })
    .then((result) => {
      geoFilter.value = result.data
        .GeoFilterForMap as AdvancedFilters;
      handleMoveBoundingBox();
    });
}

onMounted(() => {
  view.value = new View({
    center: props.center,
    zoom: props.zoom,
  });
  mapRef.value?.map.setView(view.value);
});

onBeforeMount( async () => {
  await fetchGeoFilter();
})

onBeforeUnmount(() => {
  if (!props.filtersBaseApi) return;
  Object.values(geoFilter.value)?.forEach((advancedFilter: AdvancedFilter) => {
    props.filtersBaseApi.removeFilterFromList(advancedFilter.key);
  });
})

watch(
  () => props.entities,
  () => {
    if (props.entitiesLoading || props.entities?.length <= 0) return;
    updateHeatmapFeatures(props.entities);
  },
  { immediate: true },
);
</script>

<style scoped></style>
