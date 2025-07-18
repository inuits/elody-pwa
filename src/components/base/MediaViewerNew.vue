<template>
  <div class="flex h-full checkboard select-none">
    <div
      v-if="
        !loading &&
        mediafileSelectionState[mediafileViewerContext].selectedMediafile &&
        viewerType
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
        :originalFilename="
          getValueOfMediafile(mediafileViewerContext, 'original_filename')
        "
        :mediafileId="
          getValueOfMediafile(
            mediafileViewerContext,
            'id',
            undefined,
            KeyValueSource.Root,
          )
        "
        :dimensions="dimensions"
        @toggle-preview-component:entity-id="
          (id: string) => emit('togglePreviewComponent', id)
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
    <div
      v-else-if="!loading && !viewerType"
      class="flex flex-col justify-center items-center h-full w-full p-12 text-center"
    >
      <unicon
        height="64"
        width="64"
        class="pb-4"
        :name="Unicons.DesktopSlash.name"
      />
      <p>{{ t("media-viewer.unsupported-mimetype", { mimetype }) }}</p>
    </div>
    <div v-else class="h-full w-full flex justify-center items-center">
      <spinner-loader theme="accent" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  ElodyViewers,
  type Entity,
  KeyValueSource,
  type MediaFileEntity,
} from "@/generated-types/queries";
import AudioPlayer from "@/components/base/AudioPlayer.vue";
import IIIFViewer from "@/components/IIIFViewer.vue";
import TextViewer from "@/components/base/TextViewer.vue";
import VideoPlayer from "@/components/base/VideoPlayer.vue";
import { computed, toRefs, watch, inject, defineAsyncComponent } from "vue";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";
import SpinnerLoader from "@/components/SpinnerLoader.vue";

const PDFViewer = defineAsyncComponent(
  () => import("@/components/base/PDFViewer.vue"),
);

const props = defineProps<{
  currentMediafile?: Entity | undefined;
  mediafiles?: MediaFileEntity[];
  loading?: boolean;
}>();
const emit = defineEmits<{
  (event: "togglePreviewComponent", entityId: string): void;
}>();

const mediafileViewerContext: any = inject("mediafileViewerContext");
const { mediafiles } = toRefs(props);
const { mediafileSelectionState, getValueOfMediafile } =
  useEntityMediafileSelector();
const mimetype = computed<string>(() =>
  getValueOfMediafile(
    mediafileViewerContext,
    "mimetype",
    mediafileSelectionState.value[mediafileViewerContext].selectedMediafile,
  ),
);
const dimensions = computed<{ width: number; height: number } | undefined>(() =>
  getMediaDimensions(),
);
const { t } = useI18n();

const getMediaDimensions = ():
  | { width: number; height: number }
  | undefined => {
  const height = getValueOfMediafile(
    mediafileViewerContext,
    "height",
    mediafileSelectionState.value[mediafileViewerContext].selectedMediafile,
  );
  const width = getValueOfMediafile(
    mediafileViewerContext,
    "width",
    mediafileSelectionState.value[mediafileViewerContext].selectedMediafile,
  );
  if (height && width) return { width, height };
  return undefined;
};

const viewerMap: Record<string, ElodyViewers> = {
  pdf: ElodyViewers.Pdf,
  image: ElodyViewers.Iiif,
  audio: ElodyViewers.Audio,
  video: ElodyViewers.Video,
  text: ElodyViewers.Text,
};

const viewerType = computed<ElodyViewers | undefined>(() => {
  try {
    for (const type in viewerMap) {
      if (mimetype.value.includes(type)) {
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
    if (props.currentMediafile)
      mediafileSelectionState.value[mediafileViewerContext].selectedMediafile =
        props.currentMediafile;
    else
      mediafileSelectionState.value[mediafileViewerContext].selectedMediafile =
        mediafiles?.value?.[0];
  },
  { immediate: true },
);
</script>
