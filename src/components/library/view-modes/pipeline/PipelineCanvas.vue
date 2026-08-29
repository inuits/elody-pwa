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
          :data-cy="`pipeline-edge-${edge.status}`"
          :d="edgePath(edge)"
          fill="none"
          stroke-width="1.5"
          :stroke="edgeStroke(edge)"
          :stroke-dasharray="edgeDash(edge)"
        />
      </svg>
      <!-- badges are HTML in the transformed layer so they inherit the type tokens -->
      <template v-for="edge in edges" :key="`badge-${edge.id}`">
        <span
          v-if="edge.status === 'valid'"
          class="absolute w-4 h-4 -ml-2 -mt-2 rounded-full bg-green-default text-neutral-white text-xs leading-4 text-center"
          :style="badgeStyle(edge)"
          >✓</span
        >
        <span
          v-else-if="edge.status === 'mismatch'"
          data-cy="pipeline-mismatch-badge"
          class="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-default bg-red-light text-red-dark text-xs px-2 py-0.5 whitespace-nowrap"
          :style="badgeStyle(edge)"
          >{{ edge.label || t("pipeline.legend-mismatch") }}</span
        >
      </template>
      <slot />
    </div>

    <!-- legend: only the line styles actually on the canvas -->
    <div
      v-if="legendEntries.length > 0"
      class="absolute bottom-2 left-2 flex flex-col gap-1 text-sm text-text-body bg-neutral-white/95 border border-accent-highlight rounded p-2"
    >
      <span
        v-for="entry in legendEntries"
        :key="entry.key"
        class="flex items-center gap-2 whitespace-nowrap"
      >
        <span class="flex items-center w-5">
          <span :class="['inline-block w-full border-t-2', entry.lineClass]"></span>
          <span
            v-if="entry.badge"
            class="text-green-default text-xs leading-none -ml-3"
            >{{ entry.badge }}</span
          >
        </span>
        {{ t(entry.label) }}
      </span>
    </div>

    <!-- zoom controls -->
    <div class="absolute bottom-2 right-2 flex items-center gap-1">
      <button
        data-cy="pipeline-zoom-out"
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
  status: "valid" | "mismatch" | "unknown" | "suggested";
  label?: string;
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

// A row per edge status that is actually drawn: a legend explaining line
// styles the canvas does not contain only raises the question of where they
// are.
const legendEntries = computed(() => {
  const present = new Set(props.edges.map((edge) => edge.status));
  const rows: {
    key: string;
    label: string;
    lineClass: string;
    badge?: string;
  }[] = [];
  if (present.has("unknown"))
    rows.push({
      key: "connection",
      label: "pipeline.legend-connection",
      lineClass: "border-text-light",
    });
  if (present.has("valid"))
    // a valid edge draws as a neutral line with a green check badge, so
    // that is what the legend shows
    rows.push({
      key: "valid",
      label: "pipeline.legend-valid",
      lineClass: "border-text-light",
      badge: "✓",
    });
  if (present.has("mismatch"))
    rows.push({
      key: "mismatch",
      label: "pipeline.legend-mismatch",
      lineClass: "border-dashed border-red-default",
    });
  if (present.has("suggested"))
    rows.push({
      key: "suggested",
      label: "pipeline.legend-suggested",
      lineClass: "border-dotted border-text-light",
    });
  return rows;
});

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
  const fitted = Math.floor(((viewportWidth - 8) / props.contentWidth) * 100) / 100;
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

const edgeStroke = (edge: CanvasEdge): string =>
  edge.status === "mismatch"
    ? "var(--color-red-default)"
    : "var(--color-text-light)";

const edgeDash = (edge: CanvasEdge): string | undefined => {
  if (edge.status === "mismatch") return "4 4";
  if (edge.status === "suggested") return "3 5";
  return undefined;
};

const badgeStyle = (edge: CanvasEdge) => ({
  left: `${(edge.x1 + edge.x2) / 2}px`,
  top: `${(edge.y1 + edge.y2) / 2}px`,
});
</script>
