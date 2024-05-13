<template>
  <div
    class="relative w-full"
    :class="{
      'animated-pulse bg-blue-default10': loading,
      'bg-white-background': !loading,
    }"
  >
    <div v-if="loading" class="text-center pt-5 italic">loading</div>
    <PdfToolbar
      v-show="!loading"
      v-on:zoomIn="zoomIn()"
      v-on:zoomOut="zoomOut()"
      v-on:changePage="onChangePage($event.num)"
      :pageNum="pageNum"
      :pageCount="numPages"
    />
    <div
      ref="spaceForPage"
      :class="[
        'h-[55vh] flex justify-center mt-10 w-full overflow-scroll relative',
        decentralizeFromTop ? 'mt-10' : 'items-center',
        { 'opacity-0': loading },
      ]"
    >
      <div
        id="viewerContainer"
        ref="pageContainer"
        :class="[
          'absolute w-full flex',
          decentralizeFromLeft ? '' : 'justify-center',
        ]"
      >
        <div>
          <canvas
            id="viewer"
            class="pdfViewer border-2 m-10"
            ref="canvas"
          ></canvas>
        </div>
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
import { Unicons } from "../../types";
import PdfToolbar from "../PdfToolbar.vue";
import { useGetMediafile } from "@/composables/useGetMediafile";

export default defineComponent({
  name: "PdfViewer",
  components: { PdfToolbar },
  props: {
    source: {
      type: Object as PropType<any>,
      required: true,
    },
  },
  setup(props) {
    const loading = ref<boolean>(true);
    const { source } = toRefs(props);
    const pageNum = ref<number>(1);
    const numPages = ref<number>(0);
    let pdfDoc = null;
    const pageRendering = ref<boolean>(false);
    const pageNumPending = ref(null);
    const scale = ref<number>(1);
    const url = ref<String>("");
    const canvas = ref<HTMLCanvasElement | undefined>(undefined);
    const spaceForPage = ref<HTMLDivElement | undefined>(undefined);
    const pageContainer = ref<HTMLDivElement | undefined>(undefined);
    const ctx = ref(null);
    const decentralizeFromLeft = ref<boolean>(false);
    const decentralizeFromTop = ref<boolean>(false);
    const { getMediafile, getMediafilePath } = useGetMediafile();

    const determineDecentralization = (): void => {
      decentralizeFromLeft.value =
        spaceForPage.value.clientWidth < canvas.value.clientWidth
          ? true
          : false;
      decentralizeFromTop.value =
        spaceForPage.value.offsetHeight < pageContainer.value.offsetHeight
          ? true
          : false;
    };

    function renderPage(num: number): void {
      pageRendering.value = true;
      // Using promise to fetch the page
      pdfDoc?.getPage(num).then(function (page) {
        let viewport = page.getViewport({ scale: scale.value });
        canvas.value.height = viewport.height;
        canvas.value.width = viewport.width;

        // Render PDF page into canvas context
        let renderContext = {
          canvasContext: ctx.value,
          viewport: viewport,
        };
        determineDecentralization();
        let renderTask = page.render(renderContext);

        // Wait for rendering to finish
        renderTask.promise.then(function () {
          pageRendering.value = false;
          if (pageNumPending.value !== null) {
            // New page rendering is pending
            renderPage(pageNumPending.value);
            pageNumPending.value = null;
          }
        });
      });
    }

    function queueRenderPage(num: number): void {
      if (pageRendering.value) {
        pageNumPending.value = num;
      } else {
        renderPage(num);
      }
    }

    function onChangePage(num: number): void {
      pageNum.value = num;
      queueRenderPage(parseInt(num));
    }

    onMounted(async (): void => {
      ctx.value = canvas.value.getContext("2d");
      initialRender();
    });

    const zoomIn = (): void => {
      scale.value += 0.2;
      queueRenderPage(pageNum.value);
    };

    const zoomOut = (): void => {
      scale.value -= 0.2;
      queueRenderPage(pageNum.value);
    };

    const initialRender = async () => {
      url.value =
        source.value &&
        getMediafilePath(source.value.intialValues.originalFileLocation)
          ? "/api/mediafile/" +
            getMediafilePath(source.value.intialValues.originalFileLocation)
          : "no-src";
      const response = await getMediafile(url.value);
      const pdf = await response.blob();
      const pdfUrl = URL.createObjectURL(pdf);
      pageNum.value = 1;
      scale.value = 1;
      pdfjsLib.getDocument(pdfUrl).promise.then(function (pdfDoc_) {
        pdfDoc = pdfDoc_;
        numPages.value = pdfDoc.numPages;
        // Initial/first page rendering

        renderPage(pageNum.value);
        loading.value = false;
      });
    };

    watch(source, (oldSrc, newSrc) => {
      initialRender();
    });

    return {
      loading,
      ctx,
      Unicons,
      pageNum,
      numPages,
      pdfDoc,
      zoomIn,
      zoomOut,
      onChangePage,
      canvas,
      pageContainer,
      spaceForPage,
      decentralizeFromLeft,
      decentralizeFromTop,
    };
  },
});
</script>

<style>
.h-screen-86 {
  height: 86vh;
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
