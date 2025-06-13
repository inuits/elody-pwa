<template>
  <div :class="['relative w-full h-full']">
    <div ref="OpenSeadragon-toolbar" class="hidden" />
    <viewer-toolbar
      v-model:zoomIn="zoomInDiv"
      v-model:zoomOut="zoomOutDiv"
      v-model:fullPage="fullPageButtonDiv"
      v-model:home="homeDiv"
      :originalFilename="originalFilename"
      :mediafileId="mediafileId"
      @toggle-preview-component:entity-id="(id) => togglePreviewComponent(id)"
    />
    <div ref="OpenSeadragonDiv" class="w-full h-full z-0" />
    <iiif-operations-modal :fileName="imageFilename" :dimensions="dimensions" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from "vue";
import OpenSeadragon from "openseadragon";
import ViewerToolbar from "./ViewerToolbar.vue";
import IiifOperationsModal from "@/components/modals/IiifOperationsModal.vue";

export default defineComponent({
  name: "IIIFViewer",
  components: {
    IiifOperationsModal,
    ViewerToolbar,
  },
  props: {
    imageFilename: { type: String, default: "" },
    isPublic: { type: Boolean, default: true },
    originalFilename: { type: String },
    mediafileId: { type: String },
    dimensions: { type: Object },
  },
  emits: ["togglePreviewComponent:entityId"],
  setup: (props, { emit }) => {
    const OpenSeadragonDiv = ref<HTMLDivElement | undefined>(undefined);
    const zoomInDiv = ref<string | undefined>(undefined);
    const zoomOutDiv = ref<string | undefined>(undefined);
    const fullPageButtonDiv = ref<string | undefined>(undefined);
    const homeDiv = ref<string | undefined>(undefined);
    let viewer: any = undefined;
    const loading = ref<boolean>(true);

    onMounted(() => {
      if (
        props.imageFilename &&
        props.imageFilename !== "[PROTECTED_CONTENT]"
      ) {
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
              try {
                loading.value = true;
                viewer.open(`/api/iiif/3/${value}/info.json`);
              } catch (e) {
                loading.value = false;
              }
            }
          },
        );
      }
    });

    const togglePreviewComponent = (id: string): void => {
      emit("togglePreviewComponent:entityId", id);
    };

    return {
      OpenSeadragonDiv,
      fullPageButtonDiv,
      zoomInDiv,
      zoomOutDiv,
      homeDiv,
      loading,
      togglePreviewComponent,
    };
  },
});
</script>
