<template>
  <div
    class="absolute w-full bg-background-light z-[5] p-2 shadow-sm flex justify-between items-center h-10"
  >
    <div class="pt-[10px] flex flex-row">
      <button ref="fullPageRef" class="a1 mr-2 ml-2">
        <unicon
          :name="Unicons.Desktop.name"
          height="20"
          class="text-neutral-700 cursor-pointer"
        />
      </button>
      <button ref="zoomInRef" class="mr-2">
        <unicon
          :name="Unicons.SearchPlus.name"
          height="20"
          class="text-neutral-700 cursor-pointer"
        />
      </button>
      <button ref="zoomOutRef">
        <unicon
          :name="Unicons.SearchMinus.name"
          height="20"
          class="text-neutral-700 cursor-pointer"
        />
      </button>

      <BaseTooltip v-if="enableSelection" position="top" :tooltip-offset="8">
        <template #activator="{ on }">
          <div v-on="on">
            <button
              ref="cropRef"
              :disabled="!canCrop"
              @click="$emit('toggle-selection')"
              class="ml-2 rounded-lg transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <unicon
                :name="Unicons.Crop.name"
                height="20"
                class="text-neutral-700"
              />
            </button>
          </div>
        </template>
        <span class="text-sm text-text-placeholder">
          {{
            canCrop
              ? $t("tooltip.media-viewer.selection")
              : $t("tooltip.media-viewer.selection-disabled")
          }}
        </span>
      </BaseTooltip>

      <BaseTooltip v-if="enableSelection" position="top" :tooltip-offset="8">
        <template #activator="{ on }">
          <div v-on="on">
            <button
              ref="cancelRef"
              :disabled="!canCrop"
              @click="$emit('cancel-selection')"
              class="ml-2 rounded-lg transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <unicon
                :name="Unicons.Cancel.name"
                height="20"
                class="text-neutral-700"
              />
            </button>
          </div>
        </template>
        <span class="text-sm text-text-placeholder">
          {{
            canCrop
              ? $t("tooltip.media-viewer.remove-selected-area")
              : $t("tooltip.media-viewer.selection-disabled")
          }}
        </span>
      </BaseTooltip>

      <button
        v-if="mediafileId && !downloadImageLoadingRef"
        @click="downloadImage"
      >
        <unicon
          :name="Unicons.Download.name"
          height="20"
          class="text-neutral-700 cursor-pointer ml-2"
        />
      </button>
      <spinner-loader
        v-else-if="downloadImageLoadingRef"
        class="ml-2"
        theme="accent"
        :dimensions="5"
      />
    </div>
    <div v-if="viewerContainsMultipleMediafiles">
      <button
        @click="
          () => {
            const id = selectPreviousMediafile(mediafileViewerContext);
            if (id) togglePreviewComponent(id);
          }
        "
      >
        <unicon
          :name="Unicons.ArrowCircleLeft.name"
          height="20"
          class="text-neutral-700 cursor-pointer"
        />
      </button>
      <button
        @click="
          () => {
            const id = selectNextMediafile(mediafileViewerContext);
            if (id) togglePreviewComponent(id);
          }
        "
      >
        <unicon
          :name="Unicons.ArrowCircleRight.name"
          height="20"
          class="text-neutral-700 cursor-pointer"
        />
      </button>
    </div>
    <div class="flex">
      <BaseTooltip position="top-end" :tooltip-offset="8">
        <template #activator="{ on }">
          <div v-on="on">
            <button class="mr-2 pt-[10px]" @click="openIiifOperationsModal">
              <unicon
                :name="Unicons.ImageResizeLandscape.name"
                height="20"
                class="text-neutral-700 cursor-pointer"
              />
            </button>
          </div>
        </template>
        <span class="text-sm text-text-placeholder">
          {{ $t("iiif-operations-modal.title") }}
        </span>
      </BaseTooltip>
      <button
        ref="homeRef"
        class="text-sm mr-2 text-neutral-700 cursor-pointer"
      >
        {{ $t("entity.reset-viewer") }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from "vue";
import { Unicons } from "../types";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import { useBaseModal } from "@/composables/useBaseModal";
import { ModalStyle, TypeModals } from "@/generated-types/queries";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import { useMediafileCrop } from "@/composables/useMediafileCrop";

const props = defineProps<{
  zoomIn?: HTMLDivElement | string | null;
  zoomOut?: HTMLDivElement | string | null;
  fullPage?: HTMLDivElement | string | null;
  home?: HTMLDivElement | string | null;
  originalFilename?: string;
  mediafileId?: string;
  enableSelection?: boolean;
}>();

const emit = defineEmits<{
  (event: "update:zoomIn", value: HTMLDivElement | undefined): void;
  (event: "update:zoomOut", value: HTMLDivElement | undefined): void;
  (event: "update:fullPage", value: HTMLDivElement | undefined): void;
  (event: "update:home", value: HTMLDivElement | undefined): void;
  (event: "update:crop", value: HTMLDivElement | undefined): void;
  (event: "update:cancel", value: HTMLDivElement | undefined): void;
  (event: "togglePreviewComponent:entityId", id: string): void;
  (event: "toggle-selection"): void;
  (event: "cancel-selection"): void;
}>();

const zoomInRef = ref<HTMLDivElement>();
const zoomOutRef = ref<HTMLDivElement>();
const fullPageRef = ref<HTMLDivElement>();
const homeRef = ref<HTMLDivElement>();
const cropRef = ref<HTMLDivElement>();
const cancelRef = ref<HTMLDivElement>();
const downloadImageLoadingRef = ref(false);

const { selectNextMediafile, selectPreviousMediafile } =
  useEntityMediafileSelector();
const mediafileViewerContext: any = inject("mediafileViewerContext");
const { openModal } = useBaseModal();

const { isSelectable } = useMediafileCrop();
const canCrop = computed(() =>
  Boolean(
    props.mediafileId &&
      isSelectable(props.mediafileId) &&
      props.enableSelection,
  ),
);

onMounted(() => {
  emit("update:zoomIn", zoomInRef.value);
  emit("update:zoomOut", zoomOutRef.value);
  emit("update:fullPage", fullPageRef.value);
  emit("update:home", homeRef.value);
  emit("update:crop", cropRef.value);
  emit("update:cancel", cancelRef.value);
});

const viewerContainsMultipleMediafiles = computed(
  () => mediafileViewerContext && mediafileViewerContext.mediafiles?.length > 1,
);

const getDownloadLink = async (): Promise<string> => {
  if (!props.mediafileId) {
    throw Error(`Could not download mediafile with id "${props.mediafileId}"`);
  }
  downloadImageLoadingRef.value = true;
  const imageUrl = await fetch(
    `/api/mediafiles/${props.mediafileId}/download`,
    {
      headers: { Accept: "image/jpeg" },
    },
  );
  const image = await fetch(await imageUrl.text());
  return image.url;
};

const createDownloadButton = (downloadLink: string): void => {
  const a = document.createElement("a");
  a.href = downloadLink;
  a.download = props.originalFilename || "";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const downloadImage = async () => {
  const downloadLink = await getDownloadLink();
  createDownloadButton(downloadLink);
  downloadImageLoadingRef.value = false;
};

const togglePreviewComponent = (id: string): void => {
  emit("togglePreviewComponent:entityId", id);
};

const openIiifOperationsModal = () => {
  openModal(TypeModals.IiifOperationsModal, ModalStyle.Center);
};
</script>
