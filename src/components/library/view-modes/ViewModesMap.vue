<template>
  <HeatMap
    v-if="getBasicMapProperties(config).mapType === MapTypes.HeatMap"
    :config="config"
    :entities="entities"
    :is-enabled-in-preview="isEnabledInPreview"
  />
  <WktMap
    v-if="getBasicMapProperties(config).mapType === MapTypes.WktMap"
    :wkt="wktOfEntities"
    :center="center"
  />
</template>

<script setup lang="ts">
import {
  type ConfigItem,
  type Entity,
  MapTypes,
} from "@/generated-types/queries";
import HeatMap from "@/components/maps/HeatMap.vue";
import WktMap from "@/components/maps/WktMap.vue";
import { useMaps } from "@/composables/useMaps";
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    config: ConfigItem[];
    entities: Entity[];
    isEnabledInPreview?: boolean;
    entityTypeAsCenterPoint: string;
    centerCoordinatesKey: string;
  }>(),
  {
    isEnabledInPreview: false,
  },
);

const { getBasicMapProperties } = useMaps();

const wktOfEntities = computed(() => {
  const wkts: string[] = props.entities.map((entity: Entity) => {
    return entity.intialValues?.map_location;
  });

  return wkts.filter((item: string) => !!item);
});

const center = computed(() => {
  let entity = props.entities?.find(
    (item) => item.type === props.entityTypeAsCenterPoint,
  );

  if (!entity) {
    entity = props.entities?.[0];
  }

  const keyToGetCoordinates = props.centerCoordinatesKey || "gps_coordinates";
  const coordinates = entity?.intialValues?.[keyToGetCoordinates];

  return coordinates
    ? [
        (coordinates as { latitude: number }).latitude,
        (coordinates as { longitude: number }).longitude,
      ]
    : undefined;
});
</script>

<style scoped></style>
