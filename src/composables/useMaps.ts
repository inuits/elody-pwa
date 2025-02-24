import { type ConfigItem } from "@/generated-types/queries";
import WKT from "ol/format/WKT.js";
import { Feature } from "ol";
import { Point } from "ol/geom";
import { Style, Icon } from "ol/style";

export const useMaps = () => {
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

  return {
    geoToMercator,
    getBasicMapProperties,
    getMarkerFeature,
    getWktFeature,
  };
};
