<template>
  <div
    ref="viewport"
    data-cy="pipeline-canvas"
    class="relative h-full min-h-[480px] w-full overflow-hidden rounded bg-background-normal select-none"
    :style="gridStyle"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <div
      class="absolute top-0 left-0 origin-top-left"
      :style="{
        transform: `translate(${translateX}px, ${translateY}px) scale(${zoom})`,
        width: `${contentWidth}px`,
        height: `${contentHeight}px`,
      }"
    >
      <svg
        class="absolute top-0 left-0 pointer-events-none"
        :width="contentWidth"
        :height="contentHeight"
      >
        <path
          v-for="edge in edges"
          :key="edge.id"
          data-cy="pipeline-edge"
          :d="edgePath(edge)"
          fill="none"
          stroke-width="1.5"
          stroke="var(--color-text-light)"
        />
      </svg>
      <slot />
    </div>

    <!-- zoom controls -->
    <div class="absolute bottom-2 right-2 flex items-center gap-1">
      <button
        data-cy="pipeline-zoom-out"
        :aria-label="t('pipeline.zoom-out')"
        class="w-8 h-8 rounded border border-text-light bg-background-light text-text-body cursor-pointer"
        @click.stop="setZoom(zoom - ZOOM_STEP)"
      >
        −
      </button>
      <span class="text-sm text-text-body w-10 text-center"
        >{{ Math.round(zoom * 100) }}%</span
      >
      <button
        data-cy="pipeline-zoom-in"
        :aria-label="t('pipeline.zoom-in')"
        class="w-8 h-8 rounded border border-text-light bg-background-light text-text-body cursor-pointer"
        @click.stop="setZoom(zoom + ZOOM_STEP)"
      >
        +
      </button>
      <button
        data-cy="pipeline-zoom-fit"
        class="h-8 rounded border border-text-light bg-background-light text-text-body text-xs px-2 cursor-pointer"
        @click.stop="fit(true)"
      >
        {{ t("pipeline.fit") }}
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";

type CanvasEdge = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

// Pan/zoom shell for the pipeline view mode. Only the canvas moves: a drag
// that starts on a card does nothing (cards are not draggable), and there is
// no viewport to persist — one fit-to-frame pass runs after the measured
// heights settle.
const props = defineProps<{
  contentWidth: number;
  contentHeight: number;
  edges: CanvasEdge[];
}>();

const { t } = useI18n();

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 1.6;
const ZOOM_STEP = 0.1;

const viewport = ref<HTMLElement | null>(null);
const zoom = ref(1);
const translateX = ref(0);
const translateY = ref(0);
const userInteracted = ref(false);

const gridStyle = computed(() => ({
  backgroundImage:
    "radial-gradient(circle, var(--color-neutral-light) 1px, transparent 1px)",
  backgroundSize: `${24 * zoom.value}px ${24 * zoom.value}px`,
  backgroundPosition: `${translateX.value}px ${translateY.value}px`,
}));

const clampZoom = (value: number) =>
  Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(value * 100) / 100));

const setZoom = (value: number) => {
  userInteracted.value = true;
  zoom.value = clampZoom(value);
};

const fit = (fromResetButton = false) => {
  if (fromResetButton) userInteracted.value = false;
  const viewportWidth = viewport.value?.clientWidth ?? 0;
  const viewportHeight = viewport.value?.clientHeight ?? 0;
  if (!viewportWidth || !props.contentWidth || !props.contentHeight) return;
  const fitted =
    Math.floor(((viewportWidth - 8) / props.contentWidth) * 100) / 100;
  zoom.value = Math.min(1, Math.max(0.62, fitted));
  translateX.value = Math.max(
    0,
    (viewportWidth - props.contentWidth * zoom.value) / 2,
  );
  translateY.value = Math.max(
    0,
    (viewportHeight - props.contentHeight * zoom.value) / 2,
  );
};

// One fit pass, keyed on the measured content box so it settles instead of
// looping; manual pan/zoom stops the automatic re-fit.
watch(
  () => [props.contentWidth, props.contentHeight],
  () => {
    if (!userInteracted.value) fit();
  },
  { immediate: true, flush: "post" },
);

let panning = false;
let panStart = { x: 0, y: 0, tx: 0, ty: 0 };

const onPointerDown = (event: PointerEvent) => {
  // a drag that starts on a card (or a control) pans nothing
  if ((event.target as HTMLElement)?.closest("[data-pipeline-node], button"))
    return;
  panning = true;
  panStart = {
    x: event.clientX,
    y: event.clientY,
    tx: translateX.value,
    ty: translateY.value,
  };
};

const onPointerMove = (event: PointerEvent) => {
  if (!panning) return;
  userInteracted.value = true;
  translateX.value = panStart.tx + (event.clientX - panStart.x);
  translateY.value = panStart.ty + (event.clientY - panStart.y);
};

const onPointerUp = () => {
  panning = false;
};

// Orthogonal path with rounded corners, elbow at the horizontal midpoint.
const edgePath = (edge: CanvasEdge): string => {
  const { x1, y1, x2, y2 } = edge;
  const mx = (x1 + x2) / 2;
  const dy = y2 - y1;
  if (Math.abs(dy) < 1) return `M ${x1},${y1} L ${x2},${y2}`;
  const r = Math.min(14, Math.abs(dy) / 2, Math.abs(mx - x1));
  const sy = dy > 0 ? 1 : -1;
  return [
    `M ${x1},${y1}`,
    `L ${mx - r},${y1}`,
    `Q ${mx},${y1} ${mx},${y1 + sy * r}`,
    `L ${mx},${y2 - sy * r}`,
    `Q ${mx},${y2} ${mx + r},${y2}`,
    `L ${x2},${y2}`,
  ].join(" ");
};
</script>
