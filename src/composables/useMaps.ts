import {
  type AdvancedFilter,
  type AdvancedFilters,
  type ConfigItem,
  type Entity,
} from "@/generated-types/queries";
import WKT from "ol/format/WKT.js";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { Style, Icon } from "ol/style";
import { useListItemHelper } from "@/composables/useListItemHelper";
import { useGraphqlAsync } from "@/composables/useGraphqlAsync";
import { ref } from "vue";
import { Map as OLMap } from "vue3-openlayers";
import { default as Map } from 'ol/Map';
import GeoJSON, { type GeoJSONGeometry } from "ol/format/GeoJSON";
import { fromExtent } from "ol/geom/Polygon";
import type { FiltersBaseAPI } from "@/components/filters/FiltersBase.vue";

export const useMaps = () => {
  const { setHoveredListItem } = useListItemHelper();
  const { getQueryDocument, queryAsync } = useGraphqlAsync();

  const hoveredFeature = ref<string | undefined>(undefined);

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
      })
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

  const fetchGeoFilter = async (): AdvancedFilters => {
    const queries = await getQueryDocument();
    const result = await queryAsync(queries.GetGeoFilterForMapDocument);
    return result.data.GeoFilterForMap as AdvancedFilters;
  };

  const activateNewGeoFilter = (filtersBaseApi: FiltersBaseAPI, geoFilters: AdvancedFilters, geojsonPolygon: GeoJSONGeometry) => {
    Object.values(geoFilters)?.forEach((advancedFilter: AdvancedFilter) => {
      filtersBaseApi.removeFilterFromList(advancedFilter.key);
    });
    filtersBaseApi.initializeAndActivateNewFilter(geoFilters, geojsonPolygon)
  }

  const getGeojsonPolygonFromMap = (map: Map): GeoJSONGeometry => {
    const extent = map.getView().calculateExtent(map.getSize());
    const polygon = fromExtent(extent); // extent: [minX, minY, maxX, maxY]
    const polygon4326 = polygon.clone().transform("EPSG:3857", "EPSG:4326");
    const geojsonFormat = new GeoJSON();
    return geojsonFormat.writeGeometryObject(polygon4326);
  }

  const extractGeojsonFeaturesFromEntities = (newEntities: Entity[]): any[] => {
    const featuresArray = [];
    for (let i = 0; i < newEntities.length; i++) {
      const entity = newEntities[i];
      const feature =
        entity.mapElement?.geoJsonFeature?.value ??
        entity.entityView.column.elements.mapElement?.geoJsonFeature?.value;
      if (feature) {
        featuresArray.push(feature);
      }
    }
    return featuresArray;
  }

  const handlePointerMove = (event: Event, mapRef: InstanceType<typeof OLMap.OlMap>): void => {
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

  return {
    geoToMercator,
    getBasicMapProperties,
    getMarkerFeature,
    getWktFeature,
    fetchGeoFilter,
    activateNewGeoFilter,
    getGeojsonPolygonFromMap,
    extractGeojsonFeaturesFromEntities,
    handlePointerMove
  };
};
