<template>
  <div class="relative" role="region" :aria-label="t('map.label')">
    <div class="absolute top-2 right-2 z-[1000] pointer-events-auto">
      <slot name="controls" />
    </div>
    <Map.OlMap
      ref="mapRef"
      :controls="[]"
      style="width: 100%; height: 65vh"
      :loadTilesWhileAnimating="true"
      :loadTilesWhileInteracting="true"
      @moveend="debouncedHandleMoveBoundingBox"
      @singleclick="handleMapClick"
      @pointermove="handlePointerMove"
    >
      <Map.OlOverlay
        v-if="detailPopUp.isVisible && popUpDetailConfiguration"
        :position="detailPopUp.position"
        :offset="[0, -15]"
        positioning="bottom-center"
        :autoPan="true"
      >
        <MapFeaturePopUp
          :entity="featureResult?.Entity"
          :configuration="popUpDetailConfiguration"
          :loading="featureLoading"
          @close="detailPopUp.isVisible = false"
        />
      </Map.OlOverlay>

      <Map.OlView
        ref="viewRef"
        :zoom="7"
        :maxZoom="19"
        :center="localCenter"
        :projection="activeProjection"
      />

      <Layers.OlTileLayer>
        <Sources.OlSourceOsm v-if="mapView === MapViews.Standard" />
        <Sources.OlSourceXyz
          v-if="mapView === MapViews.Satellite"
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          :maxZoom="17"
          :attributions="[
            'Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
          ]"
        />
      </Layers.OlTileLayer>

      <Layers.OlVectorLayer ref="sitesLayerRef">
        <Sources.OlSourceVector
          :projection="activeProjection"
          :features="features"
        >
        </Sources.OlSourceVector>
      </Layers.OlVectorLayer>

      <Layers.OlVectorLayer v-if="overlayFeatures.length">
        <Sources.OlSourceVector
          :projection="activeProjection"
          :features="overlayFeatures"
        />
      </Layers.OlVectorLayer>
      <MapChrome />
    </Map.OlMap>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted } from "vue";
import { Map, Layers, Sources } from "vue3-openlayers";
import { Style, Stroke, Fill } from "ol/style";
import { useMaps } from "@/composables/useMaps";
import { type Extent, extend } from "ol/extent";
import type View from "ol/View";
import type VectorLayer from "ol/layer/Vector";
import {
  MapModes,
  MapViews,
  AdvancedFilters,
  Entity,
  GetEntityByIdDocument,
  type GetEntityByIdQuery,
  type GetEntityByIdQueryVariables,
} from "@/generated-types/queries";
import { HeatMapItem } from "@/composables/useMaps";
import { FiltersBaseAPI } from "@/components/filters/FiltersBase.vue";
import debounce from "lodash.debounce";
import { useHeatMapDetailPopUp } from "@/components/maps/useHeatMapDetailPopUp";
import { useQuery } from "@vue/apollo-composable";
import MapChrome from "@/components/maps/MapChrome.vue";
import MapFeaturePopUp from "@/components/maps/MapFeaturePopUp.vue";
import { useI18n } from "vue-i18n";
import { readCssToken, withAlpha } from "@/utils/cssToken";

const props = withDefaults(
  defineProps<{
    wkt: { wkt: string, id: string }[] | HeatMapItem[];
    entities: Entity[];
    center?: number[];
    mapView?: MapViews;
    mapMode?: MapModes;
    filtersBaseApi?: FiltersBaseAPI;
    useFilters: boolean;
    geoFilters: AdvancedFilters | undefined;
    overlayWkt?: { wkt: string, id: string }[];
    bucketUntilZoom?: number;
  }>(),
  {
    center: () => [],
    mapView: MapViews.Satellite,
    mapMode: MapModes.Default,
    useFilters: false,
    overlayWkt: () => [],
  },
);

const {
  getMarkerFeature,
  transformDataToWktFeatures,
  activateNewGeoFilter,
  getGeojsonPolygonFromMap,
  getSiteStyle,
} = useMaps();

const { t } = useI18n();
const { detailPopUp, setEntityDetailConfigurations, popUpDetailConfiguration } =
  useHeatMapDetailPopUp();

const viewRef = ref<{ view: View }>(null);
// Set on the layer: Vue drops a style function bound as :style on a component.
const sitesLayerRef = ref<{ vectorLayer: VectorLayer }>();
watch(sitesLayerRef, (layer) => layer?.vectorLayer.setStyle(getSiteStyle));
const mapRef = ref<InstanceType<typeof Map.OlMap> | undefined>(undefined);
const localCenter = ref<number[]>([]);
const activeProjection = computed(() => {
  return props.mapView === MapViews.Standard ? "EPSG:3857" : "EPSG:4326";
});

const getEntityQueryVariables = computed<GetEntityByIdQueryVariables>(() => {
  return {
    id: detailPopUp.entityId!,
    type: "",
  };
});

const { result: featureResult, loading: featureLoading } =
  useQuery<GetEntityByIdQuery>(
    GetEntityByIdDocument,
    getEntityQueryVariables,
    () => ({
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "no-cache",
      enabled: !!detailPopUp.entityId,
    }),
  );

const point = computed(() => {
  if (props.mapView === MapViews.Standard) {
    return null;
  }
  const [lat, long] = props.center;
  return getMarkerFeature(lat, long, activeProjection.value);
});

const wkt = computed(() => {
  if ((!props.wkt || props.wkt.length === 0) && !point.value) return [];

  return transformDataToWktFeatures(
    props.wkt,
    props.mapMode === MapModes.HeatMode,
    activeProjection.value,
  );
});

const features = computed(() => {
  return [...wkt.value, point.value].filter((feature) => !!feature);
});

// Overlay features stay visually distinct from the entity's own geometry.
const overlayColor = readCssToken("--color-warning-chip", "orange");
const overlayStyle = new Style({
  stroke: new Stroke({ color: overlayColor, width: 2 }),
  fill: new Fill({ color: withAlpha(overlayColor, 0.15) }),
});

const overlayFeatures = computed(() => {
  const features = transformDataToWktFeatures(
    props.overlayWkt,
    false,
    activeProjection.value,
  );
  features.forEach((f) => f.setStyle(overlayStyle));
  return features;
});

const focusOnFeatures = async () => {
  const existedFeatures = wkt.value.length
    ? wkt.value
    : point.value
      ? [point.value]
      : [];
  if (existedFeatures.length > 0 && viewRef.value) {
    await nextTick();
    const extent: Extent = existedFeatures.reduce((acc, feature) => {
      if (!feature) return acc;
      const featureExtent = feature.getGeometry()?.getExtent() as Extent;
      return acc ? extend(acc, featureExtent) : featureExtent;
    }, null);

    if (extent) {
      viewRef.value.view.fit(extent, {
        padding: [50, 50, 50, 50],
        duration: 1000,
      });
    }
  }
};

const handleMoveBoundingBox = () => {
  if (!props.filtersBaseApi) return;
  const map = mapRef.value?.map;
  if (!map) return;

  const geojsonPolygon = getGeojsonPolygonFromMap(map, activeProjection.value);
  if (!props.geoFilters) return;
  const zoom = map.getView().getZoom() ?? 0;
  const bucket =
    props.bucketUntilZoom !== undefined && zoom < props.bucketUntilZoom
      ? 35
      : undefined;
  activateNewGeoFilter(props.filtersBaseApi, props.geoFilters, geojsonPolygon, bucket);
};

const debouncedHandleMoveBoundingBox = debounce(() => {
  if (!props.useFilters) return;
  handleMoveBoundingBox();
}, 1000);

const handlePointerMove = (event: any) => {
  const map = mapRef.value?.map;
  if (!map || event.dragging) return;
  map.getTargetElement().style.cursor = map.hasFeatureAtPixel(event.pixel)
    ? "pointer"
    : "";
};

const handleMapClick = (event: any) => {
  const map = mapRef.value?.map;
  if (!map) return;

  const feature = map.forEachFeatureAtPixel(event.pixel, (feat) => feat);
  if (!feature) return;
  if (feature.get("bucketCount") > 1) {
    const view = map.getView();
    view.animate({
      center: event.coordinate,
      zoom: (view.getZoom() ?? 0) + 2,
      duration: 500,
    });
    return;
  }
  detailPopUp.position = event.coordinate;
  detailPopUp.entityId = feature.id_;
  if (detailPopUp.entityId) detailPopUp.isVisible = true;
};

onMounted(async () => {
  const [lat = 0, long = 0] = props.center;
  localCenter.value = [lat, long];
  focusOnFeatures();
});

watch(
  () => props.geoFilters,
  (geoFilters) => {
    if (geoFilters && props.useFilters) handleMoveBoundingBox();
  },
)

watch(
  () => props.entities,
  async (newEntities) => {
    if (!newEntities?.length) return;
    setEntityDetailConfigurations(newEntities);
  },
  { immediate: true },
);
</script>
