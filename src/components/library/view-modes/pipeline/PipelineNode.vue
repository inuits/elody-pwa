<template>
  <div
    ref="nodeElement"
    data-pipeline-node
    class="absolute hover:z-10 focus-within:z-10"
    :style="{ left: `${x}px`, top: `${y}px`, width: `${width}px` }"
  >
    <!-- the card does not navigate in this view mode; its corner actions
         menu (connect/configure) is the interaction -->
    <slot />
    <div
      v-if="hasUnconnectedRequiredInput"
      class="text-sm text-orange-default mt-1"
    >
      {{ t("pipeline.connect-input-hint") }}
    </div>
    <span
      v-for="(port, index) in inputs"
      :key="`in-${port.id}`"
      :data-cy="`pipeline-port-in-${port.id}`"
      :class="portClasses(port, true)"
      :style="portStyle('in', index, inputs.length)"
      :title="port.label || port.id"
    />
    <template v-for="(port, index) in outputs" :key="`out-${port.id}`">
      <button
        v-if="port.shapeIris?.length"
        :data-cy="`pipeline-port-out-${port.id}`"
        :class="[...portClasses(port, false), 'cursor-pointer group/port']"
        :style="portStyle('out', index, outputs.length)"
        :title="`${t('pipeline.add-consumer')}${port.label ? ` (${port.label})` : ''}`"
        @click.stop="emit('addConsumer', port)"
      >
        <span
          class="absolute -top-[7px] -left-[7px] w-5 h-5 rounded-full bg-accent-normal text-neutral-white text-sm leading-5 text-center opacity-0 group-hover/port:opacity-100"
          >+</span
        >
      </button>
      <span
        v-else
        :data-cy="`pipeline-port-out-${port.id}`"
        :class="portClasses(port, false)"
        :style="portStyle('out', index, outputs.length)"
        :title="port.label || port.id"
      />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
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
  // an output port was clicked: open the picker scoped to this port's shape
  (event: "addConsumer", port: PipelinePort): void;
}>();

const { t } = useI18n();

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

const hasUnconnectedRequiredInput = computed(() =>
  props.inputs.some((port) => port.required && !port.connected),
);

// Input i of n sits at h * (i + 0.5) / n on the card edge.
const portStyle = (side: "in" | "out", index: number, count: number) => ({
  top: `${(props.cardHeight * (index + 0.5)) / count - 5}px`,
  [side === "in" ? "left" : "right"]: "-5px",
});

const portClasses = (port: PipelinePort, isInput: boolean) => [
  "absolute w-[10px] h-[10px] rounded-full border-2 z-content-raised",
  port.connected
    ? "bg-accent-normal border-accent-normal shadow-[0_0_0_3px_var(--color-accent-light)]"
    : isInput && port.required
      ? "bg-neutral-white border-orange-default"
      : "bg-neutral-white border-text-light",
];
</script>
