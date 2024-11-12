import { type ConfigItem } from "@/generated-types/queries";

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

  return {
    getBasicMapProperties,
    geoToMercator,
  };
};
