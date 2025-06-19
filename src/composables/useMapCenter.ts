import { computed } from "vue";
import {
  MapTypes,
  PanelType,
  type MapElement,
} from "@/generated-types/queries";
import { getValueForPanelMetadata } from "@/helpers";
import { fromLonLat } from "ol/proj";

export function useMapCenter(element: MapElement, entityId: string) {
  const normalizeCenterForHeatMap = (value: number[]) => {
    return fromLonLat(value as number[]);
  };

  const normalizeCenterForWktMap = (coordinates: {
    latitude: number;
    longitude: number;
  }): [number, number] => {
    return [coordinates.latitude, coordinates.longitude];
  };

  type CenterHandler = (value: unknown) => [number, number];

  const centerHandlers: Record<MapTypes, CenterHandler> = {
    [MapTypes.WktMap]: (value) => {
      const coordinates = value as { latitude: number; longitude: number };
      return normalizeCenterForWktMap(coordinates);
    },
    [MapTypes.HeatMap]: (value: any) => {
      return normalizeCenterForHeatMap(value);
    },
  };

  const center = computed(() => {
    const centerKey = element.center;
    const metadataCenterValue: unknown = getValueForPanelMetadata(
      PanelType.Metadata,
      centerKey,
      entityId,
      "",
    );

    if (!metadataCenterValue) return [];

    const handler = centerHandlers[element.type as MapTypes];
    return handler ? handler(metadataCenterValue) : [];
  });

  return { center };
}
