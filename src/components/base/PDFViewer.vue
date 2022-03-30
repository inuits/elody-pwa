<template>
  <object
    class="h-full w-full object-contain"
    :data="'https://coghent-api-dev.inuits.dev/storage/v1/download/' + source?.filename"
  ></object>
</template>

<script lang="ts">
  // @ts-nocheck
  import { defineComponent, onMounted, watch, ref, PropType, toRefs } from 'vue';

  //PDFJS imports
  import * as pdfjsLibImport from 'pdfjs-dist';
  const pdfjsLib: typeof import('pdfjs-dist') = pdfjsLibImport;
  import 'pdfjs-dist/build/pdf.worker.entry';
  import { PDFViewer, EventBus } from 'pdfjs-dist/web/pdf_viewer.js';
  import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
  import { MediaFileMetadata } from '@/queries';

  export default defineComponent({
    name: 'PdfViewer',
    components: {},
    props: {
      source: {
        type: Array as PropType<MediaFileMetadata[]>,
        required: true,
      },
    },
    setup(props) {
      const loading = ref<boolean>(true);
      const pdfViewer = ref<
        | {
            setDocument: (input: PDFDocumentProxy) => void;
            currentScaleValue: number;
          }
        | undefined
      >();
      const zoomLevel = ref<number>(0.5);
      const container = ref<HTMLDivElement | undefined>(undefined);

      const { source } = toRefs(props);

      watch(source, (newSrc: source[] | undefined) => {
        loading.value = true;
        if (pdfViewer.value && newSrc?.content) {
          pdfjsLib
            .getDocument({
              url: newSrc?.content,
            })
            .promise.then((pdfDocument: PDFDocumentProxy) => {
              if (pdfViewer.value) {
                pdfViewer.value.setDocument(pdfDocument);
              }
            });
        }
      });

      onMounted(async () => {
        // Init viewer with event-bus
        var eventBus = new EventBus();
        pdfViewer.value = new PDFViewer({
          container: container.value,
          eventBus,
        });

        eventBus.on('pagesinit', function () {
          if (pdfViewer.value) {
            pdfViewer.value.currentScaleValue = zoomLevel.value;
            loading.value = false;
          }
        });
      });

      const zoomIn = () => {
        if (pdfViewer.value) {
          zoomLevel.value = zoomLevel.value + 0.5;
          pdfViewer.value.currentScaleValue = zoomLevel.value;
        }
      };

      const zoomOut = () => {
        if (pdfViewer.value && zoomLevel.value != 0.5) {
          zoomLevel.value = zoomLevel.value - 0.5;
          pdfViewer.value.currentScaleValue = zoomLevel.value;
        }
      };

      return {
        zoomIn,
        zoomOut,
        loading,
        container,
      };
    },
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
