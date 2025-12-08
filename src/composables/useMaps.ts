import {
  type AdvancedFilter,
  type AdvancedFilters,
  type ConfigItem,
  type Entity,
  type MapElement,
} from "@/generated-types/queries";
import WKT from "ol/format/WKT.js";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { Style, Icon, Fill, Stroke } from "ol/style";
import { useListItemHelper } from "@/composables/useListItemHelper";
import { useGraphqlAsync } from "@/composables/useGraphqlAsync";
import { ref } from "vue";
import type { Map as OLMap } from "vue3-openlayers";
import type { default as MapType } from "ol/Map";
import GeoJSON, { type GeoJSONGeometry } from "ol/format/GeoJSON";
import { fromExtent } from "ol/geom/Polygon";
import type { FiltersBaseAPI } from "@/components/filters/FiltersBase.vue";
import type VectorSource from "ol/source/Vector";
import type { Geometry } from "geojson";
export interface HeatMapItem {
  coordinates: string;
  heatIntensity: number;
}

export interface Bucket {
  id: string;
  x: number;
  y: number;
  count: number;
  ids: string[];
  weight: number;
  averageValue: number;
}

export const useMaps = () => {
  const { setHoveredListItem } = useListItemHelper();
  const { getQueryDocument, queryAsync } = useGraphqlAsync();

  const hoveredFeature = ref<string | undefined>(undefined);
  const hotspotZoomed = ref<boolean>(false);

  const getBasicMapProperties = (config: ConfigItem[]) => {
    if (!config) return [];
    return (
      config.reduce((resultObject: any, configItem: ConfigItem) => {
        resultObject[configItem.key] = configItem.value;
        return resultObject;
      }, {}) || []
    );
  };

  // This function will map coordinates following the normal longitude latitude projection (-180, 180) to the Mercator projection
  // ! Not used anymore as it is not needed with EPSG:4326 !
  const geoToMercator = (lat, lon): [number, number] => {
    const r_major = 6378137.0;
    const x = r_major * ((lon * Math.PI) / 180);
    const scale = x / lon;
    const y =
      (180.0 / Math.PI) *
      Math.log(Math.tan(Math.PI / 4.0 + (lat * (Math.PI / 180.0)) / 2.0)) *
      scale;
    return [x, y];
  };

  const getMarkerFeature = (latitude: number, longitude: number) => {
    const markerFeature = new Feature({
      geometry: new Point([longitude, latitude]),
    });
    markerFeature.setStyle(
      new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: "/marker.png",
          scale: 0.075,
        }),
      }),
    );
    return markerFeature;
  };

  const getWktFeature = (wkt: string) => {
    const format = new WKT();
    return format.readFeature(wkt, {
      dataProjection: "EPSG:4326",
      featureProjection: "EPSG:4326",
    });
  };

  const getHeatStyle = (intensity: number): Style => {
    let rgbColor;

    if (intensity <= 4) {
      rgbColor = "0, 255, 0"; // Green
    } else if (intensity <= 6) {
      rgbColor = "255, 165, 0"; // Orange
    } else {
      rgbColor = "255, 0, 0"; // Red
    }

    return new Style({
      fill: new Fill({
        color: `rgba(${rgbColor}, 0.5)`,
      }),
      stroke: new Stroke({
        color: `rgba(${rgbColor}, 0.5)`,
        width: 6,
      }),
    });
  };

  const transformDataToWktFeatures = (
    data: (string | HeatMapItem)[],
    isHeatMode: boolean,
  ): Feature[] => {
    if (!data || data.length === 0) return [];

    if (isHeatMode) {
      return (data as HeatMapItem[]).map((item) => {
        const feature = getWktFeature(item.coordinates);
        feature.setStyle(getHeatStyle(item.heatIntensity));
        return feature;
      });
    }

    return (data as string[]).map((wkt) => getWktFeature(wkt));
  };

  const fetchGeoFilter = async (): Promise<AdvancedFilters> => {
    const queries = await getQueryDocument();
    const result = await queryAsync(queries.GetGeoFilterForMapDocument);
    return result.data.GeoFilterForMap as AdvancedFilters;
  };

  const activateNewGeoFilter = (
    filtersBaseApi: FiltersBaseAPI,
    geoFilters: any,
    geojsonPolygon: GeoJSONGeometry,
    bucket: number,
  ) => {
    Object.values(geoFilters)?.forEach((advancedFilter: AdvancedFilter) => {
      filtersBaseApi.removeFilterFromList(advancedFilter.key);
    });

    const filters = {
      ...geoFilters,
      advancedFilter: {
        ...geoFilters.advancedFilter,
        bucket: String(bucket),
      },
    };
    filtersBaseApi.initializeAndActivateNewFilter(filters, geojsonPolygon);
  };

  const getGeojsonPolygonFromMap = (map: MapType): GeoJSONGeometry => {
    const extent = map.getView().calculateExtent(map.getSize());
    const polygon = fromExtent(extent); // extent: [minX, minY, maxX, maxY]
    const polygon4326 = polygon.clone().transform("EPSG:3857", "EPSG:4326");
    const geojsonFormat = new GeoJSON();
    return geojsonFormat.writeGeometryObject(polygon4326);
  };

  // Todo: This function should be adjusted so that the map element can be resolved from each available column, the current implementation only allows it to be in the first column (it should also allow multiple heatmaps in one column)
  const getMapElementFromEntity = (entity: Entity): MapElement | undefined => {
    return (
      (entity.mapElement as MapElement) ??
      (entity.entityView.column.elements.mapElement as MapElement)
    );
  };

  const extractGeojsonFeaturesFromEntities = (newEntities: Entity[]): any[] => {
    const featuresArray = [];
    for (let i = 0; i < newEntities.length; i++) {
      const entity = newEntities[i];
      const mapElement = getMapElementFromEntity(entity);
      if (!mapElement) {
        console.error("Entity has no map element", entity);
        return [];
      }
      const feature = mapElement.geoJsonFeature?.value as GeoJSONGeometry;

      if (feature) {
        featuresArray.push(feature);
      }
    }
    return featuresArray;
  };

  const handlePointerMove = (
    event: Event,
    mapRef: InstanceType<typeof OLMap.OlMap>,
  ): void => {
    const feature = mapRef.forEachFeatureAtPixel(
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

  const zoomToHotspot = (
    map: MapType,
    src: VectorSource<Feature<Geometry>>,
  ) => {
    if (map && src && src.getFeatures().length > 0 && !hotspotZoomed.value) {
      const features = src.getFeatures();
      if (!features) return;

      const coords = features.map((f) => f.getGeometry()?.getCoordinates());
      const avg = coords
        .reduce((acc, c) => [acc[0] + c[0], acc[1] + c[1]], [0, 0])
        .map((v) => v / coords.length);

      map.getView().animate({
        center: avg,
        zoom: 10,
        duration: 800,
      });
      hotspotZoomed.value = true;
    }
  };

  return {
    geoToMercator,
    getBasicMapProperties,
    getMarkerFeature,
    getWktFeature,
    fetchGeoFilter,
    activateNewGeoFilter,
    getGeojsonPolygonFromMap,
    extractGeojsonFeaturesFromEntities,
    handlePointerMove,
    zoomToHotspot,
    getMapElementFromEntity,
    transformDataToWktFeatures,
    hotspotZoomed,
  };
};
