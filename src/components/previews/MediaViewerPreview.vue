<template>
  <div class="h-[62vh]">
    <MediaViewerNew
      :key="entityId"
      :mediafiles="mediafiles"
    />
  </div>
</template>

<script setup lang="ts">


import {
  type Entity,
} from "@/generated-types/queries";
import MediaViewerNew from "@/components/base/MediaViewerNew.vue";

const props = withDefaults(
  defineProps<{
    mediafiles: Entity[];
    entityId: string | undefined;
  }>(),
  {
  },
);

</script>

<style scoped>
</style>