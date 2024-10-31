<template>
  <HeatMap
    v-if="getMapType(entities) === MapTypes.HeatMap"
    :entities="entities"
  />
</template>


<script setup lang="ts">
import { Entity, MapTypes } from "@/generated-types/queries";
import HeatMap from "@/components/maps/HeatMap.vue";
import { useMaps } from "@/composables/useMaps";

defineProps<{
  entities: Entity[];
}>();

const { getMapType } = useMaps();
</script>

<style scoped>
</style>