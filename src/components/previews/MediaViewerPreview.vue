<template>
  <div class="h-[50vh]">
    <MediaViewerNew
      :key="entityId"
      :mediafiles="mediafiles"
      :current-mediafile="currentMediafile"
      @toggle-preview-component="(id: string) => emit('togglePreviewComponent', id)"
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
    currentMediafile?: Entity | undefined;
    mediafiles: Entity[];
    entityId: string | undefined;
  }>(),
  {
    currentMediafile: undefined,
  },
);
const emit = defineEmits<{
  (event: "togglePreviewComponent", entityId: string): void;
}>();

</script>

<style scoped>
</style>