<template>
  <div
    class="relative w-full h-full flex flex-col"
    :class="{
      'animated-pulse bg-blue-default10': loading,
      'bg-white-background': !loading,
    }"
  >
    <div v-if="loading" class="h-full w-full flex justify-center items-center">
      <spinner-loader theme="accent" />
    </div>

    <PdfToolbar
      v-show="!loading"
      @zoomIn="zoomIn"
      @zoomOut="zoomOut"
      @changePage="onChangePage"
      :pageNum="pageNum"
      :pageCount="numPages"
    />

    <div
      v-if="!loading"
      ref="spaceForPage"
      :class="[
        'h-full w-full flex justify-center w-full overflow-scroll relative',
        decentralizeFromTop ? `mt-10` : 'items-center',
        { 'opacity-0': loading },
      ]"
    >
      <div
        id="viewerContainer"
        ref="pageContainer"
        :class="[
          'absolute w-full flex',
          decentralizeFromLeft ? `` : 'justify-center',
        ]"
      >
        <div>
          <div v-if="error" class="p-4 text-sm text-red-700 bg-red-100 rounded">
            {{ error }}
          </div>

          <canvas
            v-else
            id="viewer"
            class="pdfViewer border-2 m-10"
            ref="canvas"
          ></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onUnmounted, nextTick } from "vue";
import type { Ref } from "vue";
import * as pdfjsLibImport from "pdfjs-dist";
const pdfjsLib: typeof import("pdfjs-dist") = pdfjsLibImport;
import "pdfjs-dist/build/pdf.worker";

import PdfToolbar from "../PdfToolbar.vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import { useGetMediafile } from "@/composables/useGetMediafile";

type SourceType = {
  initialValues?: {
    original_file_location?: string;
  };
  [k: string]: any;
};

const props = defineProps<{
  source: SourceType | null;
}>();

const loading = ref<boolean>(true);
const pageNum = ref<number>(1);
const numPages = ref<number>(0);
let pdfDoc: any = null;
const pageRendering = ref<boolean>(false);
const pageNumPending: Ref<number | null> = ref(null);
const scale = ref<number>(1);
const url = ref<string>("");
const canvas = ref<HTMLCanvasElement | null>(null);
const spaceForPage = ref<HTMLElement | null>(null);
const pageContainer = ref<HTMLElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);
const decentralizeFromLeft = ref<boolean>(false);
const decentralizeFromTop = ref<boolean>(false);
const error = ref<string | null>(null);

const { getMediafile, getMediafilePath } = useGetMediafile();

let currentObjectUrl: string | null = null;
let currentRenderTask: any = null;
let resizeObserver: ResizeObserver | null = null;

/* ---------- PDFJS worker hint (works with many bundlers) ---------- */
try {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.js",
    import.meta.url,
  ).toString();
} catch (e) {
  console.error(e);
}

/* ---------- Utility: determine decentralization ---------- */
const determineDecentralization = (): void => {
  if (!spaceForPage.value || !canvas.value || !pageContainer.value) return;
  try {
    decentralizeFromLeft.value =
      spaceForPage.value.clientWidth < (canvas.value?.clientWidth ?? 0);
    decentralizeFromTop.value =
      spaceForPage.value.offsetHeight <
      (pageContainer.value?.offsetHeight ?? 0);
  } catch (e) {
    decentralizeFromLeft.value = false;
    decentralizeFromTop.value = false;
    console.error(e);
  }
};

/* ---------- Render single page ---------- */
async function renderPage(num: number): Promise<void> {
  if (!canvas.value) return;
  if (!pdfDoc) return;

  pageRendering.value = true;
  try {
    const page = await pdfDoc.getPage(num);
    const viewport = page.getViewport({ scale: scale.value });

    canvas.value.width = Math.ceil(viewport.width);
    canvas.value.height = Math.ceil(viewport.height);

    if (!ctx.value) {
      const c = canvas.value.getContext("2d");
      if (!c) throw new Error("Failed to get 2D canvas context");
      ctx.value = c;
    }

    const renderContext = {
      canvasContext: ctx.value,
      viewport,
    };

    determineDecentralization();

    if (currentRenderTask && typeof currentRenderTask.cancel === "function") {
      try {
        currentRenderTask.cancel();
      } catch (err) {
        console.error(err);
      }
    }

    currentRenderTask = page.render(renderContext);

    await currentRenderTask.promise;

    pageRendering.value = false;

    if (pageNumPending.value !== null && pageNumPending.value !== undefined) {
      const next = pageNumPending.value;
      pageNumPending.value = null;
      await renderPage(next);
    }
  } catch (err: any) {
    pageRendering.value = false;
    console.error("renderPage error:", err);
    error.value = err instanceof Error ? err.message : String(err);
  }
}

function queueRenderPage(num: number): void {
  if (pageRendering.value) {
    pageNumPending.value = num;
  } else {
    void renderPage(num);
  }
}

/* ---------- Pagination handler used by toolbar ---------- */
function onChangePage(payload: any): void {
  const requested =
    typeof payload === "number" ? payload : Number(payload?.num ?? payload);
  if (!Number.isFinite(requested)) return;
  const clamped = Math.min(
    Math.max(1, requested),
    Math.max(1, numPages.value || 1),
  );
  pageNum.value = clamped;
  queueRenderPage(clamped);
}

/* ---------- Zoom handling (clamped) ---------- */
const MIN_SCALE = 0.2;
const MAX_SCALE = 4;
function zoomIn(): void {
  scale.value = Math.min(MAX_SCALE, +(scale.value + 0.2).toFixed(2));
  queueRenderPage(pageNum.value);
}
function zoomOut(): void {
  scale.value = Math.max(MIN_SCALE, +(scale.value - 0.2).toFixed(2));
  queueRenderPage(pageNum.value);
}

/* ---------- Initial render flow ---------- */
async function initialRender(): Promise<void> {
  loading.value = true;
  error.value = null;

  if (currentObjectUrl) {
    try {
      URL.revokeObjectURL(currentObjectUrl);
    } catch (e) {
      console.error(e);
    }
    currentObjectUrl = null;
  }
  if (currentRenderTask && typeof currentRenderTask.cancel === "function") {
    try {
      currentRenderTask.cancel();
    } catch (e) {
      console.error(e);
    }
  }
  pdfDoc = null;
  numPages.value = 0;
  pageNum.value = 1;

  if (!props.source) {
    error.value = "Resource not found";
    loading.value = false;
    return;
  }

  try {
    const filePath = props.source.intialValues?.original_file_location;
    console.log(filePath);
    if (!filePath) {
      error.value =
        "Mediafile has no 'original_file_location', unable to locate source file";
      loading.value = false;
      return;
    }
    url.value = `/api/mediafile/${getMediafilePath(filePath)}`;
    const response = await getMediafile(url.value);
    if (!response || !response.ok) {
      throw new Error("Failed to fetch PDF");
    }

    const pdfBlob = await response.blob();
    const pdfUrl = URL.createObjectURL(pdfBlob);
    currentObjectUrl = pdfUrl;

    pageNum.value = 1;
    scale.value = 1;

    // load doc
    // pdfjs getDocument accepts url string or object; using url works
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    pdfDoc = await loadingTask.promise;

    numPages.value = pdfDoc?.numPages ?? 0;

    // ensure canvas context after DOM update
    await nextTick();
    if (canvas.value) {
      ctx.value = canvas.value.getContext("2d");
    }

    // render first page
    await renderPage(pageNum.value);

    // setup resize observer to recompute decentralization
    if (!resizeObserver && spaceForPage.value) {
      resizeObserver = new ResizeObserver(() => determineDecentralization());
      resizeObserver.observe(spaceForPage.value);
      if (pageContainer.value) resizeObserver.observe(pageContainer.value);
    }

    loading.value = false;
  } catch (err: any) {
    console.error("PDF load failed:", err);
    error.value = err instanceof Error ? err.message : String(err);
    loading.value = false;
  }
}

watch(
  () => props.source,
  () => {
    void initialRender();
  },
  { immediate: true },
);

onUnmounted(() => {
  if (currentRenderTask && typeof currentRenderTask.cancel === "function") {
    try {
      currentRenderTask.cancel();
    } catch (e) {
      console.error(e);
    }
  }

  if (currentObjectUrl) {
    try {
      URL.revokeObjectURL(currentObjectUrl);
    } catch (e) {
      console.error(e);
    }
    currentObjectUrl = null;
  }

  if (pdfDoc && typeof pdfDoc.destroy === "function") {
    try {
      pdfDoc.destroy();
    } catch (e) {
      console.error(e);
    }
  }

  if (resizeObserver) {
    try {
      resizeObserver.disconnect();
    } catch (e) {
      console.error(e);
    }
    resizeObserver = null;
  }
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
</style>
