<template>
  <!--
    The one viewer toolbar (media-viewer.md §Round 2): mode-specific buttons in
    the same capsule style — white glyphs on translucent dark capsules over the
    viewport — so PDF, image, AV and text never grow their own chrome again.
  -->
  <div
    role="toolbar"
    :aria-label="$t('viewer.toolbar-label')"
    class="viewer-toolbar absolute w-full z-[5] p-2 flex justify-between items-center"
  >
    <div class="viewer-capsule">
      <a
        v-if="logo"
        :href="logo.href"
        target="_blank"
        rel="noopener noreferrer"
        class="viewer-toolbar__logo"
        data-testid="viewer-toolbar-logo"
      >
        <img :src="logo.src" :alt="logo.alt ?? ''" class="h-6" />
      </a>
      <button
        ref="fullPageRef"
        class="viewer-toolbar__button"
        :aria-label="$t('viewer.fullscreen')"
      >
        <unicon :name="Unicons.Desktop.name" height="16" />
      </button>
      <button
        ref="zoomInRef"
        data-testid="viewer-zoom-in"
        class="viewer-toolbar__button"
        :aria-label="$t('viewer.zoom-in')"
        @click="$emit('zoomIn')"
      >
        <unicon :name="Unicons.SearchPlus.name" height="16" />
      </button>
      <button
        ref="zoomOutRef"
        data-testid="viewer-zoom-out"
        class="viewer-toolbar__button"
        :aria-label="$t('viewer.zoom-out')"
        @click="$emit('zoomOut')"
      >
        <unicon :name="Unicons.SearchMinus.name" height="16" />
      </button>

      <BaseTooltip v-if="enableSelection" position="top" :tooltip-offset="8">
        <template #activator="{ on }">
          <div v-on="on">
            <button
              ref="cropRef"
              :disabled="!canCrop"
              :aria-label="$t('tooltip.media-viewer.selection')"
              class="viewer-toolbar__button"
              @click="$emit('toggle-selection')"
            >
              <unicon :name="Unicons.Crop.name" height="16" />
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
        <template #activator="{ on }">
          <div v-on="on">
            <button
              ref="cancelRef"
              :disabled="!canCrop"
              :aria-label="$t('tooltip.media-viewer.remove-selected-area')"
              class="viewer-toolbar__button"
              @click="$emit('cancel-selection')"
            >
              <unicon :name="Unicons.Cancel.name" height="16" />
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
        class="viewer-toolbar__button"
        :aria-label="$t('viewer.download')"
        @click="downloadImage"
      >
        <unicon :name="Unicons.Download.name" height="16" />
      </button>
      <spinner-loader
        v-else-if="downloadImageLoadingRef"
        theme="accent"
        :dimensions="5"
      />
    </div>

    <!-- PDF mode: page ‹ n/m › in the same capsule style. -->
    <div
      v-if="mode === 'pdf'"
      class="viewer-capsule"
      data-testid="viewer-page-nav"
    >
      <button
        data-testid="viewer-previous-page"
        class="viewer-toolbar__button"
        :aria-label="$t('pagination.previous')"
        :disabled="pageNum <= 1"
        @click="changePage(pageNum - 1)"
      >
        <unicon :name="Unicons.AngleLeft.name" height="16" />
      </button>
      <label class="viewer-toolbar__page">
        <span class="sr-only">{{ $t("pagination.page") }}</span>
        <input
          type="number"
          class="viewer-toolbar__page-input"
          :value="pageNum"
          min="1"
          :max="pageCount"
          @change="
            (event) =>
              changePage(Number((event.target as HTMLInputElement).value))
          "
        />
        <span aria-hidden="true">/</span>
        <span>{{ pageCount }}</span>
      </label>
      <button
        data-testid="viewer-next-page"
        class="viewer-toolbar__button"
        :aria-label="$t('pagination.next')"
        :disabled="pageNum >= pageCount"
        @click="changePage(pageNum + 1)"
      >
        <unicon :name="Unicons.AngleRight.name" height="16" />
      </button>
    </div>

    <div class="viewer-capsule">
      <BaseTooltip v-if="mode === 'image'" position="top-end" :tooltip-offset="8">
        <template #activator="{ on }">
          <div v-on="on">
            <button
              class="viewer-toolbar__button"
              data-testid="open-iiif-operations-modal"
              :aria-label="$t('iiif-operations-modal.title')"
              @click="openIiifOperationsModal"
            >
              <unicon :name="Unicons.ImageResizeLandscape.name" height="16" />
            </button>
          </div>
        </template>
        <span>
          {{ $t("iiif-operations-modal.title") }}
        </span>
      </BaseTooltip>
      <button ref="homeRef" class="viewer-toolbar__home">
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
    /** Which mode-specific buttons the capsule hosts. */
    mode?: "image" | "pdf";
    pageNum?: number;
    pageCount?: number;
  }>(),
  {
    mode: "image",
    pageNum: 1,
    pageCount: 1,
  },
);

const emit = defineEmits<{
  (event: "update:zoomIn", value: HTMLDivElement | undefined): void;
  (event: "update:zoomOut", value: HTMLDivElement | undefined): void;
  (event: "update:fullPage", value: HTMLDivElement | undefined): void;
  (event: "update:home", value: HTMLDivElement | undefined): void;
  (event: "update:crop", value: HTMLDivElement | undefined): void;
  (event: "update:cancel", value: HTMLDivElement | undefined): void;
  (event: "toggle-selection"): void;
  (event: "cancel-selection"): void;
  (event: "zoomIn"): void;
  (event: "zoomOut"): void;
  (event: "changePage", value: { num: number }): void;
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

/** Clamped: past either end nothing is emitted rather than an invalid page. */
const changePage = (page: number) => {
  const num = Math.min(Math.max(Math.trunc(page) || 1, 1), props.pageCount);
  if (num === props.pageNum) return;
  emit("changePage", { num });
};

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
.viewer-toolbar {
  /* The bar itself is not a surface; only the capsules are. */
  pointer-events: none;
}

.viewer-capsule {
  display: flex;
  align-items: center;
  gap: var(--spacing-ds-2);
  padding: var(--spacing-ds-2) var(--spacing-ds-4);
  border-radius: var(--radius-pill);
  background-color: color-mix(
    in srgb,
    var(--color-surface-inverted) 72%,
    transparent
  );
  color: var(--color-text-on-inverted);
  pointer-events: auto;
}

.viewer-toolbar__logo {
  display: inline-flex;
  padding: var(--spacing-ds-1);
  border-radius: var(--radius-input);
  background-color: var(--color-surface);
}

.viewer-toolbar__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: var(--radius-input);
  color: var(--color-text-on-inverted);
  cursor: pointer;
  transition: background-color var(--transition-duration-ui) var(--ease-ui);
}

.viewer-toolbar__button:not(:disabled):hover {
  background-color: color-mix(
    in srgb,
    var(--color-text-on-inverted) 18%,
    transparent
  );
}

.viewer-toolbar__button:focus-visible,
.viewer-toolbar__home:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 1px;
}

.viewer-toolbar__button:disabled {
  opacity: 0.4;
  cursor: default;
}

.viewer-toolbar__home {
  font-size: var(--text-ui);
  color: var(--color-text-on-inverted);
  padding: 0 var(--spacing-ds-4);
  border-radius: var(--radius-input);
  cursor: pointer;
}

.viewer-toolbar__page {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-ds-2);
  font-size: var(--text-ui);
}

.viewer-toolbar__page-input {
  width: 34px;
  height: 22px;
  padding: 0;
  text-align: center;
  border: 0;
  border-radius: var(--radius-input);
  background-color: color-mix(
    in srgb,
    var(--color-text-on-inverted) 14%,
    transparent
  );
  color: var(--color-text-on-inverted);
  font-size: var(--text-ui);
  appearance: textfield;
  -moz-appearance: textfield;
}

.viewer-toolbar__page-input::-webkit-outer-spin-button,
.viewer-toolbar__page-input::-webkit-inner-spin-button {
  appearance: none;
  margin: 0;
}

.viewer-toolbar__page-input:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 1px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>
