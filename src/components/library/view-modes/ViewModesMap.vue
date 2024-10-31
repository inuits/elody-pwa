<template>
  <HeatMap
    v-if="getBasicMapProperties(config).mapType === MapTypes.HeatMap"
    :config="config"
    :entities="entities"
  />
</template>


<script setup lang="ts">
import { ConfigItem, Entity, MapTypes } from "@/generated-types/queries";
import HeatMap from "@/components/maps/HeatMap.vue";
import { useMaps } from "@/composables/useMaps";

defineProps<{
  config: ConfigItem[]
  entities: Entity[];
}>();

const { getBasicMapProperties } = useMaps();
</script>

<style scoped>
</style>