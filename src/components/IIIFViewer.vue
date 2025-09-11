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
      :enable-selection="enableSelection"
      @toggle-selection="toggleSelection"
      @cancel-selection="undoLastSelection"
      @toggle-preview-component:entity-id="(id) => togglePreviewComponent(id)"
    />

    <div ref="OpenSeadragonDiv" class="w-full h-full z-0" />

    <iiif-operations-modal :fileName="imageFilename" :dimensions="dimensions" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import OpenSeadragon from "openseadragon";
import { ShapeNames } from "openseadragon-select-plugin";
import ViewerToolbar from "./ViewerToolbar.vue";
import IiifOperationsModal from "@/components/modals/IiifOperationsModal.vue";
import { CropAreaCoordinates } from "@/composables/useMediafileCrop";

interface Selection {
  rect: any;
  shape: string;
  overlay: any;
}

const props = defineProps<{
  imageFilename: string;
  isPublic?: boolean;
  originalFilename?: string;
  mediafileId?: string;
  dimensions?: Record<string, any>;
  enableSelection?: boolean;
  cropSizes?: CropAreaCoordinates;
}>();

const emit = defineEmits<{
  (e: "togglePreviewComponent:entityId", id: string): void;
  (e: "selectArea", size: CropAreaCoordinates, mediafileId: string): void;
}>();

const OpenSeadragonDiv = ref<HTMLDivElement>();
const OpenSeadragonToolbar = ref<HTMLDivElement>();
const zoomInDiv = ref<string>();
const zoomOutDiv = ref<string>();
const fullPageButtonDiv = ref<string>();
const homeDiv = ref<string>();

let viewer: OpenSeadragon.Viewer | null = null;
let selectionObj: any = null;
const loading = ref(true);

const isSelecting = ref(false);
const selections = ref<Selection[]>([]);

const buildCropUrl = (filename: string, { x, y, w, h }: CropAreaCoordinates) =>
  `/api/iiif/3/${filename}/${x},${y},${w},${h}/${w},${h}/0/default.jpg`;

const initViewer = () => {
  const dragonOption: OpenSeadragon.Options = {
    element: OpenSeadragonDiv.value!,
    prefixUrl: "/static/openseadragon/images/",
    toolbar: OpenSeadragonToolbar.value ?? undefined,
    tileSources: `/api/iiif/3/${props.imageFilename}/info.json`,
  };

  if (zoomInDiv.value) dragonOption.zoomInButton = zoomInDiv.value;
  if (zoomOutDiv.value) dragonOption.zoomOutButton = zoomOutDiv.value;
  if (fullPageButtonDiv.value)
    dragonOption.fullPageButton = fullPageButtonDiv.value;
  if (homeDiv.value) dragonOption.homeButton = homeDiv.value;

  if (props.cropSizes) {
    const url = buildCropUrl(props.imageFilename, props.cropSizes);
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
    onSelection: (rect: any, shape: string) => {
      const selection: Selection = { rect, shape, overlay: null };

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
      isSelecting.value = false;
    },
    keep: true,
  });

  viewer.initSelection();
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
};

onMounted(() => {
  if (props.imageFilename && props.imageFilename !== "[PROTECTED_CONTENT]") {
    initViewer();

    watch(
      () => props.imageFilename,
      (value) => {
        if (value && viewer) {
          try {
            loading.value = true;
            initViewer();
          } catch {
            loading.value = false;
          }
        }
      },
    );
  }
});

const togglePreviewComponent = (id: string) =>
  emit("togglePreviewComponent:entityId", id);
</script>

<style>
.IIIFViewer--selection .openseadragon-container {
  cursor: crosshair !important;
}
</style>
