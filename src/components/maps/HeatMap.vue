<template>
  <Map.OlMap
    ref="mapRef"
    :loadTilesWhileAnimating="true"
    :loadTilesWhileInteracting="true"
    style="height: 65vh"
    @moveend="handleMoveBoundingBox"
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
  </Map.OlMap>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { ref, toRefs, onBeforeMount, watch, shallowRef, onMounted, onBeforeUnmount } from "vue";
import {
  type Item,
  Map,
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
  type MapElement,
} from "@/generated-types/queries";
import { FiltersBaseAPI } from "@/components/filters/FiltersBase.vue";
import { useListItemHelper } from "@/composables/useListItemHelper";
import { apolloClient, router } from "@/main";

const props = withDefaults(
  defineProps<{
    config: ConfigItem[];
    entities: Entity[] | undefined;
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
const { entities } = toRefs(props);

const mapRef = ref<InstanceType<typeof Map.OlMap> | undefined>(undefined);
const heatmapSource = shallowRef(new VectorSource());
const view = ref<View | undefined>(undefined);
const contextMenuItems = ref<Item[]>([]);
const hoveredFeature = ref<string | undefined>(undefined);
const geoFilter = ref<AdvancedFilters | undefined>(undefined);

contextMenuItems.value = [
  {
    text: t("map.center-map"),
    callback: (val) => {
      view.value?.setCenter(val.coordinate);
    },
  },
  "-",
];

const updateHeatmapFeatures = (features: Feature[]) => {
  console.log("Logging all the features:");
  console.log(features);
  heatmapSource.value.clear();
  heatmapSource.value.addFeatures(features);
}

const createFeature = (mapData: MapElement, id: string): Feature => {
  return new Feature({
    geometry: new Point(
      fromLonLat([mapData.coordinates?.value[0], mapData.coordinates?.value[1]]),
    ),
    weight: mapData.weight?.value,
    id: id,
  });
};

// const featureCache = new Map<string, Feature>();
// const createOrUpdateFeature = (mapData: MapElement, id: string): Feature => {
//   let feature = featureCache.get(id);
//   const geometry = new Point(fromLonLat([mapData.coordinates?.value[0], mapData.coordinates?.value[1]]));
//
//   if (feature) {
//     feature.setGeometry(geometry);
//     feature.set('weight', mapData.weight?.value);
//   } else {
//     feature = new Feature({
//       geometry,
//       weight: mapData.weight?.value,
//       id,
//     });
//     featureCache.set(id, feature);
//   }
//   return feature;
// };



const calculateHeatmapForSingleEntity = (): Feature[] => {
  const mapData = entities.value![0].entityView.column.elements.mapElement;
  if (!mapData) return [new Feature()];
  return [createFeature(mapData, entities.value![0].id)];
}

const calculateHeatmapForMultipleEntities = (): Feature[] => {
  return entities.value!
    .filter(Boolean)
    .map((entity) => {
      const mapData = entity.mapElement;
      if (!mapData) return;
      return createFeature(mapData, entity.id);
    })
    .filter(Boolean) as Feature[];
}

const calculateHeatmapPoints = () => {
  let features: Feature[];
  if (entities.value?.length <= 0)
    features = [new Feature()];
  else if (router.currentRoute.value.name === "SingleEntity" && !props.isEnabledInPreview)
    features = calculateHeatmapForSingleEntity();
  else
    features = calculateHeatmapForMultipleEntities();
  updateHeatmapFeatures(features);
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
  () => entities.value,
  () => {
    calculateHeatmapPoints();
  },
  { immediate: true },
);
</script>

<style scoped></style>
