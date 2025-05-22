<template>
  <div class="flex h-full checkboard select-none">
    <div
      class="w-1/3"
      v-if="
        mediafileSelectionState[mediafileViewerContext].selectedMediafile &&
        mediafileSelectionState[mediafileViewerContext].mediafiles.length > 0
      "
    >
      <entity-image-selection :loading="loading" />
    </div>

    <div
      v-if="
        !loading &&
        mediafileSelectionState[mediafileViewerContext].selectedMediafile
      "
      class="w-full"
    >
      <IIIFViewer
        v-if="viewerType === ElodyViewers.Iiif"
        :imageFilename="
          getValueOfMediafile(mediafileViewerContext, 'transcode_filename') ||
          getValueOfMediafile(mediafileViewerContext, 'filename') ||
          ''
        "
        :originalFilename="getValueOfMediafile(mediafileViewerContext, 'original_filename')"
        :mediafileId="
          getValueOfMediafile(
            mediafileViewerContext,
            'id',
            undefined,
            KeyValueSource.Root,
          )
        "
      />
      <VideoPlayer
        v-if="viewerType === ElodyViewers.Video"
        :source="
          mediafileSelectionState[mediafileViewerContext].selectedMediafile
        "
      />
      <AudioPlayer
        v-if="viewerType === ElodyViewers.Audio"
        :source="
          mediafileSelectionState[mediafileViewerContext].selectedMediafile
        "
      />
      <PDFViewer
        v-if="viewerType === ElodyViewers.Pdf"
        :source="
          mediafileSelectionState[mediafileViewerContext].selectedMediafile
        "
      />
      <TextViewer
        v-if="viewerType === ElodyViewers.Text"
        :source="
          mediafileSelectionState[mediafileViewerContext].selectedMediafile
        "
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  ElodyViewers,
  KeyValueSource,
  type MediaFileEntity,
} from "@/generated-types/queries";
import AudioPlayer from "@/components/base/AudioPlayer.vue";
import EntityImageSelection from "@/components/EntityImageSelection.vue";
import IIIFViewer from "@/components/IIIFViewer.vue";
import TextViewer from "@/components/base/TextViewer.vue";
import VideoPlayer from "@/components/base/VideoPlayer.vue";
import { computed, toRefs, watch, inject, defineAsyncComponent } from "vue";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";

const PDFViewer = defineAsyncComponent(
  () => import("@/components/base/PDFViewer.vue"),
);

const props = defineProps<{
  mediafiles?: MediaFileEntity[];
  loading?: boolean;
}>();

const mediafileViewerContext: any = inject("mediafileViewerContext");
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
      mediafileViewerContext,
      "mimetype",
      mediafileSelectionState.value[mediafileViewerContext].selectedMediafile,
    );
    for (const type in viewerMap) {
      if (mimetype.includes(type)) {
        return viewerMap[type];
      }
    }
  } catch {
    return undefined;
  }

  return undefined;
});

watch(
  [() => props.loading, mediafiles],
  () => {
    if (props.loading || !mediafiles.value) return;
    mediafileSelectionState.value[mediafileViewerContext].mediafiles =
      mediafiles?.value;
    mediafileSelectionState.value[mediafileViewerContext].selectedMediafile =
      mediafiles?.value?.[0];
  },
  { immediate: true },
);
</script>
