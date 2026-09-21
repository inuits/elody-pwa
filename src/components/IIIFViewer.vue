<template>
  <div
    class="relative w-full h-full"
    :class="{ 'IIIFViewer--selection': isSelecting }"
  >
    <div ref="OpenSeadragonToolbar" class="hidden" />

    <viewer-toolbar
      v-model:zoomIn="zoomInDiv"
      v-model:zoomOut="zoomOutDiv"
      v-model:fullPage="fullPageButtonDiv"
      v-model:home="homeDiv"
      :originalFilename="originalFilename"
      :mediafileId="mediafileId"
      :image-filename="imageFilename"
      :dimensions="dimensions"
      :enable-selection="enableSelection"
      :has-crop-data="!!cropSizes"
      :showing-cropped="isShowingCropped"
      :can-recrop="canRecrop"
      :is-recrop-modal="isRecropModal"
      :logo="logo"
      @toggle-selection="toggleSelection"
      @cancel-selection="undoLastSelection"
      @toggle-crop-view="$emit('toggle-crop-view')"
      @open-recrop-modal="$emit('open-recrop-modal')"
    />

    <div
      ref="OpenSeadragonDiv"
      class="w-full h-full z-0"
      data-testid="openseadragon-container"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import OpenSeadragon from "openseadragon";
import { ShapeNames } from "openseadragon-select-plugin";
import ViewerToolbar from "./ViewerToolbar.vue";
import { CropAreaCoordinates } from "@/composables/useMediafileCrop";

interface Selection {
  overlay: any;
}

const props = withDefaults(
  defineProps<{
    imageFilename: string;
    isPublic?: boolean;
    originalFilename?: string;
    mediafileId?: string;
    dimensions?: Record<string, any>;
    enableSelection?: boolean;
    cropSizes?: CropAreaCoordinates;
    showCropped?: boolean;
    canRecrop?: boolean;
    isRecropModal?: boolean;
    logo?: { src: string; href: string; alt?: string };
  }>(),
  { showCropped: true },
);

const emit = defineEmits<{
  (e: "selectArea", size: CropAreaCoordinates, mediafileId: string): void;
  (e: "clear-selection"): void;
  (e: "toggle-crop-view"): void;
  (e: "open-recrop-modal"): void;
}>();

// showCropped defaults to true so callers that don't care about the
// original/cropped toggle (e.g. the add-flow's entity-picker preview) don't
// need to pass it.
const isShowingCropped = computed(
  () => Boolean(props.cropSizes) && props.showCropped,
);

const OpenSeadragonDiv = ref<HTMLDivElement>();
const OpenSeadragonToolbar = ref<HTMLDivElement>();
const zoomInDiv = ref<string>();
const zoomOutDiv = ref<string>();
const fullPageButtonDiv = ref<string>();
const homeDiv = ref<string>();

let viewer: OpenSeadragon.Viewer | null = null;
let selectionObj: any = null;

const isSelecting = ref(false);
const selections = ref<Selection[]>([]);
const buildCropUrl = (filename: string, { x, y, w, h }: CropAreaCoordinates) =>
  `/api/iiif/3/${filename}/${x},${y},${w},${h}/${w},${h}/0/default.jpg`;

const initViewer = () => {
  // Recreating the viewer without disposing the old one leaves its render
  // loop, event listeners and selection-plugin canvases running against a
  // torn-down DOM, which eventually throws on stale shape references.
  if (viewer) {
    viewer.destroy();
    viewer = null;
  }
  selectionObj = null;
  selections.value = [];
  isSelecting.value = false;

  const dragonOption: OpenSeadragon.Options = {
    element: OpenSeadragonDiv.value!,
    prefixUrl: "/static/openseadragon/images/",
    toolbar: OpenSeadragonToolbar.value ?? undefined,
    tileSources: `/api/iiif/3/${props.imageFilename}/info.json`,
    maxZoomPixelRatio: 3,
  };

  if (zoomInDiv.value) dragonOption.zoomInButton = zoomInDiv.value;
  if (zoomOutDiv.value) dragonOption.zoomOutButton = zoomOutDiv.value;
  if (fullPageButtonDiv.value)
    dragonOption.fullPageButton = fullPageButtonDiv.value;
  if (homeDiv.value) dragonOption.homeButton = homeDiv.value;

  if (isShowingCropped.value) {
    const url = buildCropUrl(props.imageFilename, props.cropSizes!);
    dragonOption.tileSources = { type: "image", url };
  }

  viewer = OpenSeadragon(dragonOption);
};

const toggleSelection = () => {
  if (!viewer) return;
  if (isSelecting.value) {
    selectionObj?.disable();
    isSelecting.value = false;
  } else {
    isSelecting.value = true;
    undoLastSelection();
    startSelection();
  }
};

const startSelection = () => {
  if (!viewer) return;
  if (selectionObj?.isEnabled) return;

  selectionObj = viewer.selection({
    onSelection: (rect: any) => {
      isSelecting.value = false;
      // A click without drag (or a negligible drag) yields a zero-area rect.
      // Saving that as a crop requests an invalid 0x0 IIIF region, which the
      // image server rejects and leaves the viewer blank - ignore it instead.
      if (!rect.width || !rect.height) return;

      const selection: Selection = { overlay: null };

      if (viewer) {
        selection.overlay = viewer.addOverlay({
          x: rect.x + rect.width / 2,
          y: rect.y + rect.height / 2,
          width: rect.width,
          height: rect.height,
          className: "selection-overlay",
        });

        selections.value.push(selection);
        const size: CropAreaCoordinates = {
          x: Math.round(rect.x),
          y: Math.round(rect.y),
          w: Math.round(rect.width),
          h: Math.round(rect.height),
        };

        emit("selectArea", size, props.mediafileId!);
      }
    },
    keep: true,
  });

  viewer.initSelection();
  // The plugin's windowToImageCoordinates uses an offsetParent walk, which
  // misses the position of a relative <dialog> in Chrome's top layer. Keep
  // both mouse and element positions in client coordinates instead.
  const selectionViewer = viewer;
  viewer.selectionHandler.frontCanvas.getCoordsFromMouseEvent = (event) => {
    const { left, top } = selectionViewer.element.getBoundingClientRect();
    return selectionViewer.viewport.viewerElementToImageCoordinates(
      new OpenSeadragon.Point(event.clientX - left, event.clientY - top),
    );
  };
  viewer.selectionHandler.frontCanvas.drawer.setDrawerShape(
    ShapeNames.RectShape,
  );
  selectionObj.enable();
};

const undoLastSelection = () => {
  if (selections.value.length === 0) return;

  viewer?.selectionHandler.clear();

  const lastSelection = selections.value.pop();
  if (lastSelection?.overlay && viewer) {
    viewer.removeOverlay(lastSelection.overlay);
  }
  // Lets a consumer (e.g. the recrop modal's "save" button) know the drawn
  // selection it was tracking no longer exists, so it doesn't try to save
  // coordinates for a rectangle that was just undone.
  emit("clear-selection");
};

onMounted(() => {
  if (props.imageFilename && props.imageFilename !== "[PROTECTED_CONTENT]") {
    initViewer();

    watch(
      [
        () => props.imageFilename,
        () => props.cropSizes,
        () => props.showCropped,
      ],
      ([imageFilename]) => {
        if (imageFilename && viewer) {
          try {
            initViewer();
          } catch (error) {
            console.error("Failed to initialize the image viewer", error);
          }
        }
      },
    );
  }
});
</script>

<style>
.IIIFViewer--selection .openseadragon-container {
  cursor: crosshair !important;
}
</style>
