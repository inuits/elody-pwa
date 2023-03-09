<template>
  <div :class="['relative w-full h-full']">
    <div ref="OpenSeadragon-toolbar" class="hidden" />
    <viewer-toolbar
      v-model:zoomIn="zoomInDiv"
      v-model:zoomOut="zoomOutDiv"
      v-model:fullPage="fullPageButtonDiv"
      v-model:home="homeDiv"
      :downloadLocation="downloadLocation"
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
import { defineComponent, onMounted, ref, watch } from "vue";
import OpenSeadragon from "openseadragon";
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
    let viewer: any = undefined;
    const loading = ref<boolean>(true);

    onMounted(() => {
      if (props.imageFilename) {
        const dragonOption: OpenSeadragon.Options = {
          element: OpenSeadragonDiv.value,
          prefixUrl: "/static/openseadragon/images/",
          // @ts-ignore
          toolbar: document.getElementById("OpenSeadragon-toolbar"),
          tileSources: `/api/iiif/3/${props.imageFilename}/info.json`,
        };

        if (zoomInDiv.value !== null) {
          dragonOption.zoomInButton = zoomInDiv.value;
        }
        if (zoomOutDiv.value !== null) {
          dragonOption.zoomOutButton = zoomOutDiv.value;
        }
        if (fullPageButtonDiv.value !== null) {
          dragonOption.fullPageButton = fullPageButtonDiv.value;
        }
        if (homeDiv.value !== null) {
          dragonOption.homeButton = homeDiv.value;
        }

        viewer = OpenSeadragon(dragonOption);

        watch(
          () => props.imageFilename,
          (value: string) => {
            if (value) {
              loading.value = true;
              viewer.open(`/api/iiif/3/${value}/info.json`);
            }
          }
        );

        viewer.addHandler("tile-drawn", () => {
          loading.value = false;
        });
      }
    });

    return {
      OpenSeadragonDiv,
      fullPageButtonDiv,
      zoomInDiv,
      zoomOutDiv,
      homeDiv,
      loading,
    };
  },
});
</script>
