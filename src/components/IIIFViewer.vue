<template>
  <div id="OpenSeadragon" class="h-screen w-screen" />
</template>

<script lang="ts">
// @ts-nocheck
import { defineComponent, onMounted } from "vue"
import OpenSeadragon from "openseadragon"

export default defineComponent({
  name: "IIIFViewer",
  components: {},
  setup: () => {
    onMounted(() => {
      const viewer: OpenSeadragon.Viewer = OpenSeadragon({
        element: document.getElementById("OpenSeadragon"),
        prefixUrl: "/static/openseadragon/images/",
        tileSources: {
          "@context": "http://iiif.io/api/image/2/context.json",
          "@id":
            "https://libimages1.princeton.edu/loris/pudl0001%2F4609321%2Fs42%2F00000004.jp2",
          height: 7200,
          width: 5434,
          toolbar: false,
          profile: ["http://iiif.io/api/image/2/level2.json"],
          protocol: "http://iiif.io/api/image",
          tiles: [
            {
              scaleFactors: [1, 2, 4, 8, 16, 32],
              width: 1024,
            },
          ],
        },
      })
    })
  },
})
</script>
