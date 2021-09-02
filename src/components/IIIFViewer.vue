<template>
  <div class="relative w-full h-full">
    <div ref="OpenSeadragon-toolbar" class="hidden" />
    <ViewerToolbar
      v-model:zoomIn="zoomInDiv"
      v-model:zoomOut="zoomOutDiv"
      v-model:fullPage="fullPageButtonDiv"
      v-model:home="homeDiv"
    />
    <div ref="OpenSeadragonDiv" class="w-full h-full z-0 checkboard" />
  </div>
</template>

<script lang="ts">
  import { defineComponent, onMounted, ref } from 'vue';
  import OpenSeadragon from 'openseadragon';
  import ViewerToolbar from './ViewerToolbar.vue';

  export default defineComponent({
    name: 'IIIFViewer',
    components: {
      ViewerToolbar,
    },
    props: {
      imageUrl: { type: String, default: '' },
    },
    setup: (props) => {
      const OpenSeadragonDiv = ref<HTMLDivElement | undefined>(undefined);

      const zoomInDiv = ref<string | undefined>(undefined);
      const zoomOutDiv = ref<string | undefined>(undefined);
      const fullPageButtonDiv = ref<string | undefined>(undefined);
      const homeDiv = ref<string | undefined>(undefined);

      onMounted(() => {
        const dragonOption: OpenSeadragon.Options = {
          element: OpenSeadragonDiv.value,
          prefixUrl: '/static/openseadragon/images/',
          // @ts-ignore
          toolbar: document.getElementById('OpenSeadragon-toolbar'),
          tileSources: {
            type: 'image',
            url: props.imageUrl,
          },
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

        OpenSeadragon(dragonOption);
      });

      return {
        OpenSeadragonDiv,
        zoomInDiv,
        zoomOutDiv,
        fullPageButtonDiv,
        homeDiv,
      };
    },
  });
</script>

<style scoped>
  .checkboard {
    background-color: #fff;
    background-size: 60px 60px;
    background-position: 0 0, 30px 30px;
    background-image: linear-gradient(
        45deg,
        #f4f5f7 25%,
        transparent 25%,
        transparent 75%,
        #f4f5f7 75%,
        #f4f5f7
      ),
      linear-gradient(
        45deg,
        #f4f5f7 25%,
        transparent 25%,
        transparent 75%,
        #f4f5f7 75%,
        #f4f5f7
      );
  }
</style>
