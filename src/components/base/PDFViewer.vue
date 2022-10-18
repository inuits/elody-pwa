<template>  
    <div
    class="relative w-full"
    :class="{
      'animated-pulse bg-blue-default10': loading,
      'bg-white-background': !loading,
    }"
  >
    <div v-if="loading" class="text-center pt-5 italic">
      loading
    </div>

    <div>
      <button :onclick="() => onPrevPage(canvas, ctx)">Previous</button>
      <button :onclick="() => onNextPage(canvas, ctx)">Next</button>
      &nbsp; &nbsp;
      <span>Page: <span id="page_num"></span> / <span id="page_count"></span></span>
    </div>

    <a
      v-show="!loading"
      class="cursor-pointer absolute w-8 h-8 bg-blue rounded-full top-3 right-5 flex flex-col justify-center transform shadow hover:shadow-2xl items-center z-10"
      @click="() => zoomIn(canvas, ctx)"
    >
      <span class="rounded-full w-3 h-0.5 bg-white block"></span>
      <span
        class="rounded-full w-3 h-0.5 transform rotate-90 bg-white block absolute"
      ></span>
    </a>
    <a
      v-show="!loading"
      class="cursor-pointer absolute w-8 h-8 bg-blue rounded-full top-12 right-5 flex flex-col justify-center transform shadow hover:shadow-2xl items-center z-10"
      @click="() => zoomOut(canvas, ctx)"
    >
      <span class="rounded-full w-3 h-0.5 bg-white block"></span>
    </a>
    <div
      class="h-screen-90 w-full overflow-scroll relative"
      :class="{ 'opacity-0': loading }"
    >
      <div id="viewerContainer" ref="container" class="absolute w-full flex content-center items-center">
        <canvas id="viewer" class="pdfViewer border-2"></canvas>
      </div>
    </div>
  </div>
</template>


<script lang="ts">
// @ts-nocheck
import { defineComponent, onMounted, watch, ref, toRefs } from "vue";
import type { PropType } from "vue";
//PDFJS imports
import * as pdfjsLibImport from "pdfjs-dist";
const pdfjsLib: typeof import("pdfjs-dist") = pdfjsLibImport;
import "pdfjs-dist/build/pdf.worker.entry";
import { MediaFileMetadata } from "@/queries";

export default defineComponent({
  name: "PdfViewer",
  components: {},
  props: {
    source: {
      type: Object as PropType<MediaFileMetadata>,
      required: true,
    },
  },
  setup(props) {
    const loading = ref<boolean>(true);
    const { source } = toRefs(props);
    const pageNum = ref<number>(1);
    let pdfDoc = null;
    const pageRendering = ref<boolean>(false);
    const pageNumPending = ref(null);
    const scale = ref<number>(1.2);
    const url = ref<String>(source.value.original_file_location);
    const canvas = ref(null);
    const ctx = ref(null);

    function renderPage(num, canvas, ctx) {
      pageRendering.value = true;
      // Using promise to fetch the page
      pdfDoc.getPage(num).then(function(page) {
        let viewport = page.getViewport({scale: scale.value});
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        let renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };
        let renderTask = page.render(renderContext);

        // Wait for rendering to finish
        renderTask.promise.then(function() {
          pageRendering.value = false;
          if (pageNumPending.value !== null) {
            // New page rendering is pending
            renderPage(pageNumPending.value);
            pageNumPending.value = null;
          }
        });
      // Update page counters
      document.getElementById('page_num').textContent = num;
      })};

      function queueRenderPage(num, canvas, ctx) {
        if (pageRendering.value) {
          pageNumPending.value = num;
        } else {
          renderPage(num, canvas, ctx);
        }
      };

      function onPrevPage(canvas, ctx) {
        if (pageNum.value <= 1) {
          return;
        }
        pageNum.value--;
        queueRenderPage(pageNum.value, canvas, ctx);
      };

      function onNextPage(canvas, ctx) {
        if (pageNum.value >= pdfDoc.numPages) {
          return;
        }
        pageNum.value++;
        queueRenderPage(pageNum.value, canvas, ctx);
      };
    

    onMounted(async () => {
      canvas.value = document.getElementById('viewer');
      ctx.value = canvas.value.getContext('2d');

      pdfjsLib.getDocument(url.value).promise.then(function(pdfDoc_) {
        pdfDoc = pdfDoc_;
        document.getElementById('page_count').textContent = pdfDoc.numPages;

        // Initial/first page rendering
        renderPage(pageNum.value, canvas.value, ctx.value);
        loading.value = false;
      });
    });

    const zoomIn = (canvas, ctx) => {
      scale.value += 0.2;
      queueRenderPage(pageNum.value, canvas, ctx);
    };

    const zoomOut = (canvas, ctx) => {
      scale.value -= 0.2;
      queueRenderPage(pageNum.value, canvas, ctx);
    };

    watch(source, (oldSrc, newSrc) => {
      console.log("Source changed");
    })

    return {
      zoomIn,
      zoomOut,
      loading,
      canvas,
      ctx,
      onPrevPage,
      onNextPage,
    };
  }
});

</script>
<style>
.h-screen-90 {
  height: 90vh;
}

.textLayer {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  opacity: 0.2;
  line-height: 1;
}

.textLayer > span {
  color: transparent;
  position: absolute;
  white-space: pre;
  cursor: text;
  transform-origin: 0% 0%;
}

.textLayer .highlight {
  margin: -1px;
  padding: 1px;
  background-color: rgba(180, 0, 170, 1);
  border-radius: 4px;
}

.textLayer .highlight.begin {
  border-radius: 4px 0 0 4px;
}

.textLayer .highlight.end {
  border-radius: 0 4px 4px 0;
}

.textLayer .highlight.middle {
  border-radius: 0;
}

.textLayer .highlight.selected {
  background-color: rgba(0, 100, 0, 1);
}

.textLayer ::-moz-selection {
  background: rgba(0, 0, 255, 1);
}

.textLayer ::selection {
  background: rgba(0, 0, 255, 1);
}

.textLayer .endOfContent {
  display: block;
  position: absolute;
  left: 0;
  top: 100%;
  right: 0;
  bottom: 0;
  z-index: -1;
  cursor: default;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.textLayer .endOfContent.active {
  top: 0;
}

.pdfViewer .canvasWrapper {
  overflow: hidden;
}

.pdfViewer .page {
  direction: ltr;
  width: 816px;
  height: 1056px;
  margin: 1px auto -8px;
  position: relative;
  overflow: visible;
  border: 9px solid transparent;
  background-clip: content-box;
  /* -o-border-image: url(images/shadow.png) 9 9 repeat; */
  /* border-image: url(images/shadow.png) 9 9 repeat; */
  background-color: rgba(255, 255, 255, 1);
  position: relative;
}

.pdfViewer.removePageBorders .page {
  margin: 0 auto 10px;
  border: none;
}

.pdfViewer.singlePageView {
  display: inline-block;
}

.pdfViewer.singlePageView .page {
  margin: 0;
  border: none;
}

.pdfViewer.scrollHorizontal,
.pdfViewer.scrollWrapped,
.spread {
  margin-left: 3.5px;
  margin-right: 3.5px;
  text-align: center;
}

.pdfViewer.scrollHorizontal,
.spread {
  white-space: nowrap;
}

.pdfViewer.removePageBorders,
.pdfViewer.scrollHorizontal .spread,
.pdfViewer.scrollWrapped .spread {
  margin-left: 0;
  margin-right: 0;
}

.spread .page,
.pdfViewer.scrollHorizontal .page,
.pdfViewer.scrollWrapped .page,
.pdfViewer.scrollHorizontal .spread,
.pdfViewer.scrollWrapped .spread {
  display: inline-block;
  vertical-align: middle;
}

.spread .page,
.pdfViewer.scrollHorizontal .page,
.pdfViewer.scrollWrapped .page {
  margin-left: -3.5px;
  margin-right: -3.5px;
}

.pdfViewer.removePageBorders .spread .page,
.pdfViewer.removePageBorders.scrollHorizontal .page,
.pdfViewer.removePageBorders.scrollWrapped .page {
  margin-left: 5px;
  margin-right: 5px;
}

.pdfViewer .page canvas {
  margin: 0;
  display: block;
}

.pdfViewer .page canvas[hidden] {
  display: none;
}

.pdfViewer .page .loadingIcon {
  position: absolute;
  display: block;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  /* background: url('images/loading-icon.gif') center no-repeat; */
}
</style>
