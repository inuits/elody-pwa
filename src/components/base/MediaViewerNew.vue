<template>
  <div class="flex h-full checkboard select-none">
    <div
      v-if="
        !loading &&
        mediafileSelectionState[mediafileViewerContext].selectedMediafile &&
        viewerType
      "
      class="relative w-full"
    >
      <div
        v-if="viewerContainsMultipleMediafiles"
        class="absolute top-0 left-1/2 -translate-x-1/2 z-30 h-10 flex items-center gap-2 pointer-events-none"
      >
        <button
          class="pointer-events-auto"
          data-testid="nav-prev-mediafile"
          @click="selectPreviousMediafileHandler"
        >
          <unicon
            :name="Unicons.ArrowCircleLeft.name"
            height="20"
            class="text-neutral-700 cursor-pointer"
          />
        </button>
        <button
          class="pointer-events-auto"
          data-testid="nav-next-mediafile"
          @click="selectNextMediafileHandler"
        >
          <unicon
            :name="Unicons.ArrowCircleRight.name"
            height="20"
            class="text-neutral-700 cursor-pointer"
          />
        </button>
      </div>
      <IIIFViewer
        v-if="viewerType === ElodyViewers.Iiif && !displayProcessingImage"
        :imageFilename="
          getValueOfMediafile(mediafileViewerContext, 'display_filename') || ''
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
        @select-area="onSelectArea"
        @toggle-crop-view="toggleCropView"
        @open-recrop-modal="openRecropModal"
        :enable-selection="isCropModeEnabled"
        :crop-sizes="displayedCropSizes"
        :show-cropped="showCropped"
        :can-recrop="canRecrop"
      />
      <RecropModal
        v-if="canRecrop"
        :open="isRecropModalOpen"
        :image-filename="
          getValueOfMediafile(mediafileViewerContext, 'display_filename') || ''
        "
        :original-filename="
          getValueOfMediafile(mediafileViewerContext, 'original_filename')
        "
        :mediafile-id="mediafileId"
        :dimensions="dimensions"
        :saving="savingRecrop"
        @close="closeRecropModal"
        @save="onSaveRecrop"
      />
      <div
        v-if="displayProcessingImage"
        class="flex justify-center flex-col items-center h-full"
      >
        <unicon
          name="image-slash"
          class="h-15 w-15 p-1 text-text-body rounded-sm outline-none self-center"
        />
        <div class="text-text-body">
          {{ t("media-viewer.processing-image") }}
        </div>
      </div>
      <AudioAndVideoPlayer
        v-if="viewerType === ElodyViewers.Video"
        :source="
          mediafileSelectionState[mediafileViewerContext].selectedMediafile
        "
        media-type="Video"
      />
      <AudioAndVideoPlayer
        v-if="viewerType === ElodyViewers.Audio"
        :source="
          mediafileSelectionState[mediafileViewerContext].selectedMediafile
        "
        media-type="Audio"
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
      v-else-if="!loading && !viewerType && embedUrl"
      class="flex flex-col h-full w-full bg-neutral-0"
    >
      <div
        class="flex items-center justify-between gap-2 px-3 py-2 border-b border-neutral-30"
      >
        <span class="truncate text-sm text-text-body" :title="linkOutUrl">
          {{ linkOutUrl }}
        </span>
        <a
          class="flex shrink-0 items-center gap-2 px-3 py-1.5 rounded-md bg-accent-normal text-white hover:bg-accent-dark transition cursor-pointer"
          :href="linkOutUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          <unicon height="16" width="16" :name="Unicons.Link.name" />
          {{ t("media-viewer.open-url") }}
        </a>
      </div>
      <iframe
        class="grow w-full border-0"
        :src="embedUrl"
        :title="t('media-viewer.external-url')"
        referrerpolicy="strict-origin-when-cross-origin"
        allowfullscreen
      ></iframe>
    </div>
    <div
      v-else-if="!loading && !viewerType && linkOutUrl"
      class="flex flex-col justify-center items-center h-full w-full p-12 text-center"
    >
      <unicon height="64" width="64" class="pb-4" :name="Unicons.Link.name" />
      <p>{{ t("media-viewer.external-url") }}</p>
      <a
        class="mt-4 flex items-center gap-2 px-4 py-2 rounded-md bg-accent-normal text-white hover:bg-accent-dark transition cursor-pointer"
        :href="linkOutUrl"
        target="_blank"
        rel="noopener noreferrer"
      >
        <unicon height="18" width="18" :name="Unicons.Link.name" />
        {{ t("media-viewer.open-url") }}
      </a>
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
      <p v-if="mimetype">
        {{ t("media-viewer.unsupported-mimetype", { mimetype }) }}
      </p>
      <p v-else>{{ t("media-viewer.no-viewer") }}</p>
      <button
        v-if="mediafileId && mimetype"
        class="mt-4 flex items-center gap-2 px-4 py-2 rounded-md bg-accent-normal text-white hover:bg-accent-dark transition cursor-pointer"
        @click="downloadMediafile(mediafileId!, originalFilename)"
      >
        <unicon height="18" width="18" :name="Unicons.Download.name" />
        {{ t("media-viewer.download") }}
      </button>
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
  type Entitytyping,
  KeyValueSource,
  type MediaFileEntity,
} from "@/generated-types/queries";
import IIIFViewer from "@/components/IIIFViewer.vue";
import RecropModal from "@/components/RecropModal.vue";
import TextViewer from "@/components/base/TextViewer.vue";
import {
  computed,
  ref,
  toRefs,
  watch,
  inject,
  defineAsyncComponent,
} from "vue";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import { Unicons } from "@/types";
import { useI18n } from "vue-i18n";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import {
  useMediafileCrop,
  type CropAreaCoordinates,
} from "@/composables/useMediafileCrop";
import { useMediafileRecrop } from "@/composables/useMediafileRecrop";
import AudioAndVideoPlayer from "@/components/base/AudioAndVideoPlayer.vue";
import { useMediafileDownload } from "@/composables/useMediafileDownload";
import { getEmbeddableUrl, getExternalHttpUrl } from "@/utils/embeddableUrl";
import { getViewerForMimetype } from "@/utils/mimetype";

const PDFViewer = defineAsyncComponent(
  () => import("@/components/base/PDFViewer.vue"),
);

const props = defineProps<{
  currentMediafile?: Entity | undefined;
  mediafiles?: MediaFileEntity[];
  loading?: boolean;
  cropMediafileCoordinatesKey: string;
  parentEntityId?: string;
  parentEntityType?: Entitytyping;
  relationType?: string;
  refetchEntities?: () => Promise<void>;
}>();

const emit = defineEmits<{
  (event: "togglePreviewComponent", entityId: string): void;
}>();

const mediafileViewerContext: any = inject("mediafileViewerContext", "");
const { mediafiles } = toRefs(props);
const {
  mediafileSelectionState,
  getValueOfMediafile,
  selectNextMediafile,
  selectPreviousMediafile,
} = useEntityMediafileSelector();
const mimetype = computed<string>(() => {
  return getValueOfMediafile(
    mediafileViewerContext,
    "mimetype",
    mediafileSelectionState.value[mediafileViewerContext].selectedMediafile,
  );
});
const dimensions = computed<{ width: number; height: number } | undefined>(() =>
  getMediaDimensions(),
);
const { t } = useI18n();
const { cropSizes, addMediafileCropCoordinates, isCropModeEnabled } =
  useMediafileCrop({
    currentMediafile: props.currentMediafile,
    cropMediafileCoordinatesKey: props.cropMediafileCoordinatesKey,
  });
const { downloadMediafile } = useMediafileDownload();

const mediafileId = computed<string | undefined>(() =>
  getValueOfMediafile(
    mediafileViewerContext,
    "id",
    mediafileSelectionState.value[mediafileViewerContext].selectedMediafile,
    KeyValueSource.Root,
  ),
);

const {
  isRecropModalOpen,
  canRecrop,
  openRecropModal,
  closeRecropModal,
  saveRecrop,
} = useMediafileRecrop({
  parentEntityId: props.parentEntityId,
  parentEntityType: props.parentEntityType,
  relationType: props.relationType,
  cropMediafileCoordinatesKey: props.cropMediafileCoordinatesKey,
});

const showCropped = ref(true);
const savingRecrop = ref(false);

const recropOverride = ref<CropAreaCoordinates>();

const displayedCropSizes = computed<CropAreaCoordinates | undefined>(
  () => recropOverride.value ?? cropSizes.value,
);

watch(mediafileId, () => {
  showCropped.value = true;
  recropOverride.value = undefined;
});

const toggleCropView = () => {
  showCropped.value = !showCropped.value;
};

const onSelectArea = (coordinates: CropAreaCoordinates, id: string) => {
  if (!isCropModeEnabled.value) return;
  addMediafileCropCoordinates(coordinates, id);
};

const onSaveRecrop = (coordinates: CropAreaCoordinates, id: string) => {
  savingRecrop.value = true;
  saveRecrop(coordinates, id)
    .then(async () => {
      recropOverride.value = coordinates;
      showCropped.value = true;
      await props.refetchEntities?.();
    })
    .catch((error) => {
      console.error("Failed to save the recropped area", error);
    })
    .finally(() => {
      savingRecrop.value = false;
    });
};
const originalFilename = computed<string | undefined>(() =>
  getValueOfMediafile(
    mediafileViewerContext,
    "original_filename",
    mediafileSelectionState.value[mediafileViewerContext].selectedMediafile,
  ),
);

// Reserved key: a mediafile can stand in for an external link instead of a stored file.
const externalUrl = computed<string | undefined>(() =>
  getValueOfMediafile(
    mediafileViewerContext,
    "external_url",
    mediafileSelectionState.value[mediafileViewerContext].selectedMediafile,
  ),
);
// Only providers with a real embed player are framed - see getEmbeddableUrl. Everything
// else would hit X-Frame-Options and render a blank frame, so it links out instead.
const embedUrl = computed<string | undefined>(() =>
  getEmbeddableUrl(externalUrl.value),
);
const linkOutUrl = computed<string | undefined>(() =>
  getExternalHttpUrl(externalUrl.value),
);

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

const displayProcessingImage = computed<boolean>(() => {
  if (viewerType.value !== ElodyViewers.Iiif) return false;
  const hasTranscodeFilename = !!getValueOfMediafile(
    mediafileViewerContext,
    "display_filename",
    mediafileSelectionState.value[mediafileViewerContext].selectedMediafile,
  );
  return hasTranscodeFilename ? false : true;
});

const viewerType = computed<ElodyViewers | undefined>(() =>
  getViewerForMimetype(mimetype.value),
);

const togglePreviewComponent = (id: string): void => {
  emit("togglePreviewComponent", id);
};

const viewerContainsMultipleMediafiles = computed((): boolean => {
  const mediafiles =
    mediafileSelectionState.value?.[mediafileViewerContext]?.mediafiles || [];
  return mediafiles.length > 1;
});

const selectNextMediafileHandler = (): void => {
  const id = selectNextMediafile(mediafileViewerContext);
  if (id) togglePreviewComponent(id);
};

const selectPreviousMediafileHandler = (): void => {
  const id = selectPreviousMediafile(mediafileViewerContext);
  if (id) togglePreviewComponent(id);
};

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
