<template>
  <div :class="['relative w-full h-full']">
    <div ref="OpenSeadragon-toolbar" class="hidden" />

    <viewer-toolbar
      v-model:zoomIn="zoomInDiv"
      v-model:zoomOut="zoomOutDiv"
      v-model:fullPage="fullPageButtonDiv"
      v-model:home="homeDiv"
      :downloadLocation="downloadLocation"
      @setDrawingTool="setDrawingTool"
    />
    <div
      v-show="loading"
      class="absolute flex h-full items-center justify-center text-center w-full z-40"
    >
      {{ $t("loading") }}
    </div>
    <div ref="OpenSeadragonDiv" class="w-full h-full z-0" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch, nextTick } from "vue";
import OpenSeadragon from "openseadragon";
import Annotorious from "@recogito/annotorious-openseadragon";
import "@recogito/annotorious-openseadragon/dist/annotorious.min.css";
import ViewerToolbar from "./ViewerToolbar.vue";

export default defineComponent({
  name: "IIIFViewer",
  components: {
    ViewerToolbar,
  },
  props: {
    imageFilename: { type: String, default: "" },
    isPublic: { type: Boolean, default: true },
    downloadLocation: { type: String },
  },
  setup: (props) => {
    const OpenSeadragonDiv = ref<HTMLDivElement | undefined>(undefined);
    const zoomInDiv = ref<string | undefined>(undefined);
    const zoomOutDiv = ref<string | undefined>(undefined);
    const fullPageButtonDiv = ref<string | undefined>(undefined);
    const homeDiv = ref<string | undefined>(undefined);
    const selectedTool = ref<string>("rect");
    const loading = ref<boolean>(true);

    let viewer: any = undefined;
    let anno: any = undefined;

    const setDrawingTool = (tool: string) => {
      selectedTool.value = tool;

      if (anno) {
        anno.setDrawingTool(tool);
        viewer.setMouseNavEnabled(false);
        viewer.outerTracker.setTracking(false);
      }
    };

    onMounted(() => {
      nextTick(() => {
        if (
          props.imageFilename &&
          props.imageFilename !== "[PROTECTED_CONTENT]" &&
          OpenSeadragonDiv.value
        ) {
          const dragonOption: OpenSeadragon.Options = {
            element: OpenSeadragonDiv.value,
            prefixUrl: "/static/openseadragon/images/",
            toolbar: document.getElementById("OpenSeadragon-toolbar"),
            tileSources: `/api/iiif/3/${props.imageFilename}/info.json`,
          };

          if (zoomInDiv.value !== null)
            dragonOption.zoomInButton = zoomInDiv.value;
          if (zoomOutDiv.value !== null)
            dragonOption.zoomOutButton = zoomOutDiv.value;
          if (fullPageButtonDiv.value !== null)
            dragonOption.fullPageButton = fullPageButtonDiv.value;
          if (homeDiv.value !== null) dragonOption.homeButton = homeDiv.value;

          viewer = OpenSeadragon(dragonOption);

          viewer.addHandler("open", () => {
            anno = Annotorious(viewer);
            anno.setDrawingTool(selectedTool.value);

            anno.on("cancelSelected", () => {
              viewer.setMouseNavEnabled(true);
              viewer.outerTracker.setTracking(true);
            });

            anno.on("createAnnotation", (annotation: any) => {
              console.log("Created annotation:", annotation);
              viewer.setMouseNavEnabled(true);
              viewer.outerTracker.setTracking(true);
            });

            anno.on("updateAnnotation", (annotation: any) => {
              console.log("Updated annotation:", annotation);
            });

            anno.on("deleteAnnotation", (annotation: any) => {
              console.log("Deleted annotation:", annotation);
            });
          });

          watch(
            () => props.imageFilename,
            (value: string) => {
              if (value) {
                try {
                  loading.value = true;
                  viewer.open(`/api/iiif/3/${value}/info.json`);
                } catch (e) {
                  loading.value = false;
                }
              }
            }
          );

          viewer.addHandler("tile-drawn", () => {
            loading.value = false;
          });
        } else {
          console.error("OpenSeadragonDiv is null or undefined");
        }
      });
    });

    return {
      OpenSeadragonDiv,
      fullPageButtonDiv,
      zoomInDiv,
      zoomOutDiv,
      homeDiv,
      loading,
      setDrawingTool,
    };
  },
});
</script>
