<template>
  <div class="flex ml-1 h-full checkboard select-none">
    <div
      class="w-1/3 m-5"
      v-if="
        mediafileSelectionState.selectedMediafile &&
        mediafileSelectionState.mediafiles.length > 0
      "
    >
      <entity-image-selection :loading="loading" />
    </div>

    <div
      v-if="!loading && mediafileSelectionState.selectedMediafile"
      class="w-full"
    >
      <IIIFViewer
        v-if="getValueOfMediafile('mimetype')?.includes('image')"
        :imageFilename="
          getValueOfMediafile('transcode_filename') ||
          getValueOfMediafile('filename') ||
          ''
        "
        :downloadLocation="getValueOfMediafile('original_file_location')"
      />
      <VideoPlayer
        v-if="getValueOfMediafile('mimetype')?.includes('video')"
        :source="mediafileSelectionState.selectedMediafile"
      />
      <AudioPlayer
        v-if="getValueOfMediafile('mimetype')?.includes('audio')"
        :source="mediafileSelectionState.selectedMediafile"
      />
      <PDFViewer
        v-if="getValueOfMediafile('mimetype')?.includes('pdf')"
        :source="mediafileSelectionState.selectedMediafile"
      />
      <TextViewer
        v-if="getValueOfMediafile('mimetype')?.includes('text/plain')"
        :source="mediafileSelectionState.selectedMediafile"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { MediaFileEntity } from "@/generated-types/queries";
import AudioPlayer from "@/components/base/AudioPlayer.vue";
import EntityImageSelection from "@/components/EntityImageSelection.vue";
import IIIFViewer from "@/components/IIIFViewer.vue";
import PDFViewer from "@/components/base/PDFViewer.vue";
import TextViewer from "@/components/base/TextViewer.vue";
import VideoPlayer from "@/components/base/VideoPlayer.vue";
import { toRefs, watch } from "vue";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";

const props = defineProps<{
  mediafiles: MediaFileEntity[];
  loading: boolean;
}>();

const { mediafiles } = toRefs(props);
const { mediafileSelectionState, getValueOfMediafile } =
  useEntityMediafileSelector();

watch([() => props.loading, mediafiles], () => {
  if (props.loading) return;
  mediafileSelectionState.mediafiles = mediafiles.value;
  mediafileSelectionState.selectedMediafile = mediafiles.value[0];
});
</script>
