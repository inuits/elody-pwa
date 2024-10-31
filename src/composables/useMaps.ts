import type {
  Entity,
  MapComponent
} from "@/generated-types/queries";


export const useMaps = () => {
  const getMapType = (entities: Entity[]) => {
    if (!entities || !entities[0].mapComponent) return;
    return entities[0].mapComponent.mapType;
  }

  const getBasicMapProperties = (entities: Entity[]) => {
    const mapComponent: MapComponent = entities[0]?.mapComponent;
    return {
      zoom: mapComponent.zoom,
      center: mapComponent.center,
      blur: mapComponent.blur,
      radius: mapComponent.radius
    };
  }

  // This function will map coordinates following the normal longitude latitude projection (-180, 180) to the Mercator projection
  const geoToMercator = (lat, lon): [number, number] => {
    const r_major = 6378137.000;
    const x = r_major * (lon * Math.PI / 180);
    const scale = x / lon;
    const y = 180.0 / Math.PI * Math.log(Math.tan(Math.PI / 4.0 + lat * (Math.PI / 180.0) / 2.0)) * scale;
    return [x, y];
  }

  return {
    getMapType,
    getBasicMapProperties,
    geoToMercator
  };
}



