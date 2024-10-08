<template>
  <div class="h-[62vh]">
    <media-viewer :mediafiles="entities" :loading="entitiesLoading" />
  </div>
</template>

<script lang="ts" setup>
import type { Entity } from "@/generated-types/queries";
import MediaViewer from "@/components/base/Mediaviewer.vue";

defineProps<{
  entities: Entity[];
  entitiesLoading: boolean;
}>();
</script>

<style></style>
