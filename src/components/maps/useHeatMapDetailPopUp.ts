import { computed, reactive, ref } from "vue";
import type { Entity, MapFeatureMetadata } from "@/generated-types/queries";
import { useMaps } from "@/composables/useMaps";

type DetailPopUp = {
  isVisible: boolean;
  position: [number, number] | undefined;
  entityId: string | undefined;
};

export const useHeatMapDetailPopUp = (): {
  detailPopUp: DetailPopUp;
  setEntityDetailConfigurations(entities: Entity[]): void;
  getDetailConfigurationForEntity(
    entityId: string,
  ): MapFeatureMetadata | undefined;
  popUpDetailConfiguration: MapFeatureMetadata | undefined;
} => {
  const detailPopUp = reactive<DetailPopUp>({
    isVisible: false,
    position: undefined,
    entityId: undefined,
  });
  const popUpDetailConfiguration = computed<MapFeatureMetadata | undefined>(
    () => {
      if (detailPopUp.entityId)
        return getDetailConfigurationForEntity(detailPopUp.entityId);
      return undefined;
    },
  );

  const entityDetailConfigurations = ref<{ [key: string]: MapFeatureMetadata }>(
    {},
  );

  const _normalizeMapFeatureMetadata = (
    mapFeatureMetadata: MapFeatureMetadata,
  ): MapFeatureMetadata => {
    const newMapFeatureMetadata: { [key: string]: any } = {};
    Object.entries(mapFeatureMetadata).forEach(([key, value]) => {
      if (key === "__typename" && typeof value === "string") return;
      newMapFeatureMetadata[key] = value;
    });
    return newMapFeatureMetadata as MapFeatureMetadata;
  };

  const setEntityDetailConfigurations = (entities: Entity[]): void => {
    entities.forEach((entity: Entity) => {
      const mapElement = useMaps().getMapElementFromEntity(entity);
      if (
        entityDetailConfigurations.value[entity.id] ||
        !mapElement?.mapFeatureMetadata
      )
        return;
      entityDetailConfigurations.value[entity.id] =
        _normalizeMapFeatureMetadata(mapElement.mapFeatureMetadata);
    });
  };

  const getDetailConfigurationForEntity = (
    entityId: string,
  ): MapFeatureMetadata | undefined => {
    return entityDetailConfigurations.value[entityId] || undefined;
  };

  return {
    detailPopUp,
    setEntityDetailConfigurations,
    getDetailConfigurationForEntity,
    popUpDetailConfiguration,
  };
};
