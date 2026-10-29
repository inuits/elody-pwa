<template>
  <div
    role="toolbar"
    :aria-label="$t('media-viewer.toolbar')"
    class="absolute w-full bg-background-light z-[5] px-2 shadow-sm flex justify-between items-center gap-1 h-(--viewer-toolbar-height)"
  >
    <div class="flex items-center gap-1">
      <a
        v-if="logo"
        :href="logo.href"
        target="_blank"
        rel="noopener noreferrer"
        class="mx-2 flex"
        data-testid="viewer-toolbar-logo"
      >
        <img :src="logo.src" :alt="logo.alt ?? ''" class="h-6" />
      </a>
      <button
        v-if="mode !== 'text'"
        ref="fullPageRef"
        type="button"
        class="viewer-button"
        :aria-label="$t('media-viewer.fullscreen')"
        @click="$emit('fullscreen')"
      >
        <unicon :name="Unicons.Desktop.name" height="20" />
      </button>
      <button
        ref="zoomInRef"
        type="button"
        class="viewer-button"
        :aria-label="$t('media-viewer.zoom-in')"
        @click="$emit('zoom-in')"
      >
        <unicon :name="Unicons.SearchPlus.name" height="20" />
      </button>
      <button
        ref="zoomOutRef"
        type="button"
        class="viewer-button"
        :aria-label="$t('media-viewer.zoom-out')"
        @click="$emit('zoom-out')"
      >
        <unicon :name="Unicons.SearchMinus.name" height="20" />
      </button>
      <button
        v-if="mode === 'image'"
        ref="rotateRef"
        type="button"
        class="viewer-button"
        data-testid="viewer-rotate"
        :aria-label="$t('media-viewer.rotate')"
      >
        <unicon :name="Unicons.Redo.name" height="20" />
      </button>

      <BaseTooltip v-if="enableSelection" position="top" :tooltip-offset="8">
        <template #activator="{ on, describedBy }">
          <div v-on="on" :aria-describedby="describedBy" class="flex">
            <button
              type="button"
              class="viewer-button"
              data-testid="draw-crop-selection"
              :aria-label="$t('tooltip.media-viewer.selection')"
              :disabled="!canCrop"
              @click="$emit('toggle-selection')"
            >
              <unicon :name="Unicons.Crop.name" height="20" />
            </button>
          </div>
        </template>
        <span>
          {{
            canCrop
              ? $t("tooltip.media-viewer.selection")
              : $t("tooltip.media-viewer.selection-disabled")
          }}
        </span>
      </BaseTooltip>

      <BaseTooltip v-if="enableSelection" position="top" :tooltip-offset="8">
        <template #activator="{ on, describedBy }">
          <div v-on="on" :aria-describedby="describedBy" class="flex">
            <button
              type="button"
              class="viewer-button"
              data-testid="cancel-crop-selection"
              :aria-label="$t('tooltip.media-viewer.remove-selected-area')"
              :disabled="!canCrop"
              @click="$emit('cancel-selection')"
            >
              <unicon :name="Unicons.Cancel.name" height="20" />
            </button>
          </div>
        </template>
        <span>
          {{
            canCrop
              ? $t("tooltip.media-viewer.remove-selected-area")
              : $t("tooltip.media-viewer.selection-disabled")
          }}
        </span>
      </BaseTooltip>

      <button
        v-if="mediafileId && !downloadImageLoadingRef"
        type="button"
        class="viewer-button"
        data-testid="viewer-download"
        :aria-label="$t('media-viewer.download')"
        :title="$t('media-viewer.download')"
        @click="downloadImage"
      >
        <unicon :name="Unicons.Download.name" height="20" />
      </button>
      <spinner-loader
        v-else-if="downloadImageLoadingRef"
        class="mx-1"
        theme="accent"
        :dimensions="5"
      />

      <BaseTooltip v-if="canRecrop" position="top" :tooltip-offset="8">
        <template #activator="{ on, describedBy }">
          <div v-on="on" :aria-describedby="describedBy" class="flex">
            <button
              type="button"
              class="viewer-button"
              data-testid="open-recrop-modal"
              :aria-label="$t('tooltip.media-viewer.recrop')"
              @click="$emit('open-recrop-modal')"
            >
              <unicon :name="Unicons.Crop.name" height="20" />
            </button>
          </div>
        </template>
        <span>{{ $t("tooltip.media-viewer.recrop") }}</span>
      </BaseTooltip>

      <button
        v-if="hasCropData"
        type="button"
        class="viewer-button viewer-button--text"
        data-testid="toggle-crop-view"
        @click="$emit('toggle-crop-view')"
      >
        {{
          showingCropped
            ? $t("tooltip.media-viewer.show-original")
            : $t("tooltip.media-viewer.show-cropped")
        }}
      </button>
    </div>
    <div v-if="$slots.navigation" class="flex items-center">
      <slot name="navigation" />
    </div>
    <div v-if="mode === 'pdf'" class="flex items-center gap-1 text-table">
      <button
        type="button"
        class="viewer-button"
        :aria-label="$t('media-viewer.previous-page')"
        :title="$t('media-viewer.previous-page')"
        :disabled="page <= 1"
        @click="$emit('change-page', page - 1)"
      >
        <unicon :name="Unicons.AngleLeft.name" height="20" />
      </button>
      <input
        type="number"
        class="viewer-page-input"
        min="1"
        :max="pageCount"
        :value="page"
        :aria-label="$t('pagination.page-number')"
        @change="changePage"
      />
      <span class="text-neutral-700">/ {{ pageCount }}</span>
      <button
        type="button"
        class="viewer-button"
        :aria-label="$t('media-viewer.next-page')"
        :title="$t('media-viewer.next-page')"
        :disabled="page >= pageCount"
        @click="$emit('change-page', page + 1)"
      >
        <unicon :name="Unicons.AngleRight.name" height="20" />
      </button>
    </div>
    <div v-else-if="mode === 'image'" class="flex items-center gap-1">
      <BaseTooltip position="top-end" :tooltip-offset="8">
        <template #activator="{ on, describedBy }">
          <div v-on="on" :aria-describedby="describedBy" class="flex">
            <button
              type="button"
              class="viewer-button"
              data-testid="open-iiif-operations-modal"
              :aria-label="$t('iiif-operations-modal.title')"
              @click="openIiifOperationsModal"
            >
              <unicon :name="Unicons.ImageResizeLandscape.name" height="20" />
            </button>
          </div>
        </template>
        <span>
          {{ $t("iiif-operations-modal.title") }}
        </span>
      </BaseTooltip>
      <button
        ref="homeRef"
        type="button"
        class="viewer-button viewer-button--text"
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

const props = withDefaults(
  defineProps<{
    mode?: "image" | "pdf" | "text";
    page?: number;
    pageCount?: number;
    zoomIn?: HTMLDivElement | string | null;
    zoomOut?: HTMLDivElement | string | null;
    fullPage?: HTMLDivElement | string | null;
    home?: HTMLDivElement | string | null;
    rotate?: HTMLButtonElement | null;
    originalFilename?: string;
    mediafileId?: string;
    imageFilename?: string;
    dimensions?: Record<string, any>;
    enableSelection?: boolean;
    hasCropData?: boolean;
    showingCropped?: boolean;
    canRecrop?: boolean;
    isRecropModal?: boolean;
    logo?: { src: string; href: string; alt?: string };
  }>(),
  { mode: "image", page: 1, pageCount: 1 },
);

const emit = defineEmits<{
  (event: "update:zoomIn", value: HTMLDivElement | undefined): void;
  (event: "update:zoomOut", value: HTMLDivElement | undefined): void;
  (event: "update:fullPage", value: HTMLDivElement | undefined): void;
  (event: "update:home", value: HTMLDivElement | undefined): void;
  (event: "update:rotate", value: HTMLButtonElement | undefined): void;
  (event: "toggle-selection"): void;
  (event: "cancel-selection"): void;
  (event: "toggle-crop-view"): void;
  (event: "open-recrop-modal"): void;
  (event: "fullscreen"): void;
  (event: "zoom-in"): void;
  (event: "zoom-out"): void;
  (event: "change-page", page: number): void;
}>();

const zoomInRef = ref<HTMLDivElement>();
const zoomOutRef = ref<HTMLDivElement>();
const fullPageRef = ref<HTMLDivElement>();
const homeRef = ref<HTMLDivElement>();
const rotateRef = ref<HTMLButtonElement>();

const { openModal } = useBaseModal();

const { isSelectable } = useMediafileCrop();
const canCrop = computed(() =>
  Boolean(
    props.isRecropModal ||
    (props.mediafileId &&
      isSelectable(props.mediafileId) &&
      props.enableSelection),
  ),
);

const { downloadMediafile, downloadLoading: downloadImageLoadingRef } =
  useMediafileDownload();

onMounted(() => {
  emit("update:zoomIn", zoomInRef.value);
  emit("update:zoomOut", zoomOutRef.value);
  emit("update:fullPage", fullPageRef.value);
  emit("update:home", homeRef.value);
  emit("update:rotate", rotateRef.value);
});

const changePage = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const page = Math.min(
    Math.max(1, Math.round(Number(input.value)) || props.page),
    props.pageCount,
  );
  input.value = String(page);
  emit("change-page", page);
};

const downloadImage = () => {
  downloadMediafile(props.mediafileId!, props.originalFilename);
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

<style scoped>
.viewer-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: var(--viewer-button-width);
  height: var(--viewer-button-height);
  border-radius: var(--viewer-button-radius);
  color: var(--color-neutral-700);
  cursor: pointer;
}
.viewer-button--text {
  padding: 0 var(--viewer-text-button-padding-x);
  font-size: var(--text-table);
}
.viewer-button:hover:not(:disabled) {
  background: var(--color-accent-wash);
}
.viewer-page-input {
  width: var(--viewer-page-input-width);
  height: var(--viewer-button-height);
  padding: 0;
  border: none;
  border-radius: var(--viewer-button-radius);
  background: var(--color-surface-muted);
  text-align: center;
  font-size: var(--text-table);
  appearance: textfield;
}
.viewer-page-input::-webkit-outer-spin-button,
.viewer-page-input::-webkit-inner-spin-button {
  appearance: none;
  margin: 0;
}
.viewer-button:disabled {
  color: var(--color-text-disabled);
  cursor: not-allowed;
}
</style>
