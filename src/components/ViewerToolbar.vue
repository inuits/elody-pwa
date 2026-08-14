<template>
  <div
    class="absolute w-full bg-background-light z-[5] p-2 shadow-sm flex justify-between items-center h-10"
  >
    <div class="pt-[10px] flex flex-row">
      <a
        v-if="logo"
        :href="logo.href"
        target="_blank"
        rel="noopener noreferrer"
        class="mr-2 ml-2 flex"
        data-testid="viewer-toolbar-logo"
      >
        <img :src="logo.src" :alt="logo.alt ?? ''" class="h-6" />
      </a>
      <button
        ref="fullPageRef"
        class="a1 mr-2 ml-2"
        @click="mode === 'pdf' && $emit('full-page')"
      >
        <unicon
          :name="Unicons.Desktop.name"
          height="20"
          class="text-neutral-700 cursor-pointer"
        />
      </button>
      <button
        ref="zoomInRef"
        class="mr-2"
        @click="mode === 'pdf' && $emit('zoom-in')"
      >
        <unicon
          :name="Unicons.SearchPlus.name"
          height="20"
          class="text-neutral-700 cursor-pointer"
        />
      </button>
      <button ref="zoomOutRef" @click="mode === 'pdf' && $emit('zoom-out')">
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
        <span class="text-value text-text-placeholder">
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
        <span class="text-value text-text-placeholder">
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
    <!-- PDF mode: page ‹ n/m › capsule (one ViewerToolbar for every viewer
         mode — the separate PdfToolbar is retired). -->
    <div v-if="mode === 'pdf'" class="flex select-none items-center">
      <span class="mr-2">{{ $t("pagination.page") }}</span>
      <button
        class="cursor-pointer"
        :aria-label="$t('pagination.previous')"
        @click="changePage((pageNum ?? 1) - 1)"
      >
        <unicon :name="Unicons.AngleLeft.name" class="text-neutral-700" />
      </button>
      <span class="mr-1 ml-1 select-none">
        <input
          ref="pageInputRef"
          type="number"
          :value="pageNum"
          class="h-6 w-8 rounded border-none p-0"
          min="1"
          :max="pageCount"
          :aria-label="$t('pagination.page')"
          @change="
            (event) =>
              changePage(
                parseInt((event.target as HTMLInputElement).value, 10),
              )
          "
        />
        /
        <span class="inline-block w-8">{{ pageCount }}</span>
      </span>
      <button
        class="mr-1 ml-1 cursor-pointer"
        :aria-label="$t('pagination.next')"
        @click="changePage((pageNum ?? 1) + 1)"
      >
        <unicon :name="Unicons.AngleRight.name" class="text-neutral-700" />
      </button>
    </div>
    <div v-else class="flex">
      <BaseTooltip position="top-end" :tooltip-offset="8">
        <template #activator="{ on }">
          <div v-on="on">
            <button
              class="mr-2 pt-[10px]"
              data-testid="open-iiif-operations-modal"
              @click="openIiifOperationsModal"
            >
              <unicon
                :name="Unicons.ImageResizeLandscape.name"
                height="20"
                class="text-neutral-700 cursor-pointer"
              />
            </button>
          </div>
        </template>
        <span class="text-value text-text-placeholder">
          {{ $t("iiif-operations-modal.title") }}
        </span>
      </BaseTooltip>
      <button
        ref="homeRef"
        class="text-value mr-2 text-neutral-700 cursor-pointer"
      >
        {{ $t("entity.reset-viewer") }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { Unicons } from "../types";
import { useBaseModal } from "@/composables/useBaseModal";
import { ModalStyle, TypeModals } from "@/generated-types/queries";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import { useMediafileCrop } from "@/composables/useMediafileCrop";
import { useMediafileDownload } from "@/composables/useMediafileDownload";

const props = defineProps<{
  zoomIn?: HTMLDivElement | string | null;
  zoomOut?: HTMLDivElement | string | null;
  fullPage?: HTMLDivElement | string | null;
  home?: HTMLDivElement | string | null;
  originalFilename?: string;
  mediafileId?: string;
  imageFilename?: string;
  dimensions?: Record<string, any>;
  enableSelection?: boolean;
  logo?: { src: string; href: string; alt?: string };
  /** "image" (OpenSeadragon, default) binds zoom/home via element refs;
   *  "pdf" swaps the right side for the page capsule and emits zoom/page
   *  events instead. One toolbar for every viewer mode (media-viewer.md). */
  mode?: "image" | "pdf";
  pageNum?: number;
  pageCount?: number;
}>();

const emit = defineEmits<{
  (event: "update:zoomIn", value: HTMLDivElement | undefined): void;
  (event: "update:zoomOut", value: HTMLDivElement | undefined): void;
  (event: "update:fullPage", value: HTMLDivElement | undefined): void;
  (event: "update:home", value: HTMLDivElement | undefined): void;
  (event: "update:crop", value: HTMLDivElement | undefined): void;
  (event: "update:cancel", value: HTMLDivElement | undefined): void;
  (event: "toggle-selection"): void;
  (event: "cancel-selection"): void;
  (event: "zoom-in"): void;
  (event: "zoom-out"): void;
  (event: "full-page"): void;
  (event: "change-page", value: { num: number }): void;
}>();

const zoomInRef = ref<HTMLDivElement>();
const zoomOutRef = ref<HTMLDivElement>();
const fullPageRef = ref<HTMLDivElement>();
const homeRef = ref<HTMLDivElement>();
const cropRef = ref<HTMLDivElement>();
const cancelRef = ref<HTMLDivElement>();

const { openModal } = useBaseModal();

const { isSelectable } = useMediafileCrop();
const canCrop = computed(() =>
  Boolean(
    props.mediafileId &&
    isSelectable(props.mediafileId) &&
    props.enableSelection,
  ),
);

const { downloadMediafile, downloadLoading: downloadImageLoadingRef } =
  useMediafileDownload();

onMounted(() => {
  emit("update:zoomIn", zoomInRef.value);
  emit("update:zoomOut", zoomOutRef.value);
  emit("update:fullPage", fullPageRef.value);
  emit("update:home", homeRef.value);
  emit("update:crop", cropRef.value);
  emit("update:cancel", cancelRef.value);
});

const downloadImage = () => {
  downloadMediafile(props.mediafileId!, props.originalFilename);
};

const pageInputRef = ref<HTMLInputElement>();
const changePage = (page: number): void => {
  if (Number.isNaN(page)) return;
  const num = Math.min(Math.max(page, 1), props.pageCount ?? 1);
  if (pageInputRef.value) pageInputRef.value.value = num.toString();
  emit("change-page", { num });
};

const openIiifOperationsModal = () => {
  openModal(
    TypeModals.IiifOperationsModal,
    ModalStyle.Center,
    undefined,
    undefined,
    false,
    undefined,
    {
      fileName: props.imageFilename,
      originalFilename: props.originalFilename,
      dimensions: props.dimensions,
    },
  );
};
</script>
