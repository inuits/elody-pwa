<template>
  <div
    ref="nodeElement"
    data-pipeline-node
    class="absolute hover:z-10 focus-within:z-10"
    :style="{ left: `${x}px`, top: `${y}px`, width: `${width}px` }"
  >
    <!-- the card does not navigate in this view mode; its corner actions
         menu is the interaction -->
    <slot />
    <span
      v-for="(port, index) in inputs"
      :key="`in-${port.id}`"
      :data-cy="`pipeline-port-in-${port.id}`"
      :class="portClasses"
      :style="portStyle('in', index, inputs.length)"
    />
    <span
      v-for="(port, index) in outputs"
      :key="`out-${port.id}`"
      :data-cy="`pipeline-port-out-${port.id}`"
      :class="portClasses"
      :style="portStyle('out', index, outputs.length)"
    />
  </div>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import type { PipelinePort } from "@/components/library/view-modes/composables/useEntityPipelineGraph";

// Positions one existing list item on the pipeline canvas and draws its port
// dots. The card itself is the slotted ListItem — this wrapper adds no card
// of its own. Heights are measured, not guessed: the rendered height is
// reported upwards so the layout recomputes and edges land on real dots.
const props = withDefaults(
  defineProps<{
    x: number;
    y: number;
    width: number;
    cardHeight: number;
    inputs: PipelinePort[];
    outputs: PipelinePort[];
  }>(),
  {},
);

const emit = defineEmits<{
  (event: "measured", height: number): void;
}>();

const nodeElement = ref<HTMLElement | null>(null);
let resizeObserver: ResizeObserver | undefined;

const reportHeight = () => {
  const height = nodeElement.value?.offsetHeight;
  if (height) emit("measured", height);
};

onMounted(() => {
  reportHeight();
  if (typeof ResizeObserver !== "undefined" && nodeElement.value) {
    resizeObserver = new ResizeObserver(() => reportHeight());
    resizeObserver.observe(nodeElement.value);
  }
});

onBeforeUnmount(() => resizeObserver?.disconnect());

// Input i of n sits at h * (i + 0.5) / n on the card edge.
const portStyle = (side: "in" | "out", index: number, count: number) => ({
  top: `${(props.cardHeight * (index + 0.5)) / count - 5}px`,
  [side === "in" ? "left" : "right"]: "-5px",
});

// every drawn port has an edge attached, so all dots share one style
const portClasses =
  "absolute w-[10px] h-[10px] rounded-full border-2 z-content-raised bg-accent-normal border-accent-normal shadow-[0_0_0_3px_var(--color-accent-light)]";
</script>
