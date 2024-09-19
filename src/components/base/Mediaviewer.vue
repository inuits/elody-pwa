<template>
  <div class="flex ml-1 h-full checkboard select-none">
    <div
      class="w-1/3 max-h-3"
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
        v-if="viewerType === ElodyViewers.Iiif"
        :imageFilename="
          getValueOfMediafile('transcode_filename') ||
          getValueOfMediafile('filename') ||
          ''
        "
        :downloadLocation="getValueOfMediafile('original_file_location')"
      />
      <VideoPlayer
        v-if="viewerType === ElodyViewers.Video"
        :source="mediafileSelectionState.selectedMediafile"
      />
      <AudioPlayer
        v-if="viewerType === ElodyViewers.Audio"
        :source="mediafileSelectionState.selectedMediafile"
      />
      <PDFViewer
        v-if="viewerType === ElodyViewers.Pdf"
        :source="mediafileSelectionState.selectedMediafile"
      />
      <TextViewer
        v-if="viewerType === ElodyViewers.Text"
        :source="mediafileSelectionState.selectedMediafile"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ElodyViewers, type MediaFileEntity } from "@/generated-types/queries";
import AudioPlayer from "@/components/base/AudioPlayer.vue";
import EntityImageSelection from "@/components/EntityImageSelection.vue";
import IIIFViewer from "@/components/IIIFViewer.vue";
import PDFViewer from "@/components/base/PDFViewer.vue";
import TextViewer from "@/components/base/TextViewer.vue";
import VideoPlayer from "@/components/base/VideoPlayer.vue";
import { computed, toRefs, watch } from "vue";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";

const props = defineProps<{
  mediafiles?: MediaFileEntity[];
  loading?: boolean;
}>();

const { mediafiles } = toRefs(props);
const { mediafileSelectionState, getValueOfMediafile } =
  useEntityMediafileSelector();

const viewerMap: Record<string, ElodyViewers> = {
  pdf: ElodyViewers.Pdf,
  image: ElodyViewers.Iiif,
  audio: ElodyViewers.Audio,
  video: ElodyViewers.Video,
  text: ElodyViewers.Text,
};

const viewerType = computed<ElodyViewers | undefined>(() => {
  try {
    const mimetype: string = getValueOfMediafile(
      "mimetype",
      mediafileSelectionState.selectedMediafile
    );
    for (const type in viewerMap) {
      if (mimetype.includes(type)) {
        return viewerMap[type];
      }
    }
  } catch {
    return undefined;
  }
});

watch([() => props.loading, mediafiles], () => {
  if (props.loading) return;
  mediafileSelectionState.mediafiles = mediafiles?.value || [];
  mediafileSelectionState.selectedMediafile = mediafiles?.value?.[0];
});
</script>
