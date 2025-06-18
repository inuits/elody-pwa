import { computed } from "vue";
import {
  MapTypes,
  PanelType,
  type MapElement,
} from "@/generated-types/queries";
import { getValueForPanelMetadata } from "@/helpers";

export function useMapCenter(element: MapElement, entityId: string) {
  const normalizeCenterForWktMap = (
    coordinates: [number, number],
  ): [number, number] => {
    return [coordinates[1], coordinates[0]];
  };

  const normalizeCenterForHeatMap = (coordinates: {
    latitude: number;
    longitude: number;
  }): [number, number] => {
    return [coordinates.latitude, coordinates.longitude];
  };

  type CenterHandler = (value: unknown) => [number, number];

  const centerHandlers: Record<MapTypes, CenterHandler> = {
    [MapTypes.WktMap]: (value) => {
      const coordinates = value as [number, number];
      return normalizeCenterForWktMap(coordinates);
    },
    [MapTypes.HeatMap]: (value) => {
      const coordinates = value as { latitude: number; longitude: number };
      return normalizeCenterForHeatMap(coordinates);
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
