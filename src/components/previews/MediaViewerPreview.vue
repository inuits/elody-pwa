<template>
  <div class="h-[50vh]">
    <div v-if="mediafilesLoading" class="h-full w-full flex justify-center items-center">
      <spinner-loader theme="accent" />
    </div>
    <MediaViewerNew
      v-else
      :key="entityId"
      :mediafiles="mediafiles"
      :current-mediafile="currentMediafile"
      :cropMediafileCoordinatesKey="cropMediafileCoordinatesKey"
      @toggle-preview-component="
        (id: string) => emit('togglePreviewComponent', id)
      "
    />
  </div>
</template>

<script setup lang="ts">
import { type Entity } from "@/generated-types/queries";
import MediaViewerNew from "@/components/base/MediaViewerNew.vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";

withDefaults(
  defineProps<{
    currentMediafile?: Entity | undefined;
    mediafiles: Entity[];
    mediafilesLoading: boolean;
    entityId: string | undefined;
    cropMediafileCoordinatesKey: string;
  }>(),
  {
    currentMediafile: undefined,
  },
);
const emit = defineEmits<{
  (event: "togglePreviewComponent", entityId: string): void;
}>();
</script>

<style scoped></style>
