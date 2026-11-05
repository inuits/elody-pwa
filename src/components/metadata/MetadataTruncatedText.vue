<template>
  <div
    ref="textContainer"
    class="text-container"
    :style="{ '--line-clamp': lineClamp }"
    :class="{ 'line-clamp': !disabled }"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { wrappedChipsWidth } from "@/components/metadata/wrappedChipsWidth";

const props = defineProps({
  lineClamp: {
    type: Number,
    default: 1,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["overflow-status"]);

const textContainer = ref<HTMLDivElement | null>(null);

const checkOverflow = () => {
  if (!textContainer.value) return;
  const isOverflowing =
    !props.disabled &&
    textContainer.value.scrollHeight > textContainer.value.clientHeight;
  emit("overflow-status", isOverflowing);
};

const hugWrappedChips = () => {
  const container = textContainer.value;
  if (!container) return;
  container.style.width = "";
  const chips = [...container.querySelectorAll(".multiselect-tag")].map(
    (chip) => chip.getBoundingClientRect(),
  );
  const width = wrappedChipsWidth(container.getBoundingClientRect().left, chips);
  if (width) container.style.width = `${width}px`;
};

let resizeObserver: ResizeObserver | undefined;
let rowObserver: ResizeObserver | undefined;

onMounted(() => {
  if (!textContainer.value) return;

  resizeObserver = new ResizeObserver(() => checkOverflow());
  resizeObserver.observe(textContainer.value);

  const row = textContainer.value.parentElement;
  if (!row) return;
  rowObserver = new ResizeObserver(hugWrappedChips);
  rowObserver.observe(row);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  rowObserver?.disconnect();
});

watch(() => [props.lineClamp, props.disabled], checkOverflow);
</script>

<style scoped>
.text-container {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow-wrap: anywhere;
}
.text-container.line-clamp {
  line-clamp: var(--line-clamp);
  -webkit-line-clamp: var(--line-clamp);
}
</style>
