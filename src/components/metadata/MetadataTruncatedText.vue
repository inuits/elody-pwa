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

let resizeObserver: ResizeObserver | undefined;

onMounted(() => {
  if (!textContainer.value) return;

  resizeObserver = new ResizeObserver(() => checkOverflow());
  resizeObserver.observe(textContainer.value);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});

watch(() => [props.lineClamp, props.disabled], checkOverflow);
</script>

<style scoped>
.text-container {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  word-break: break-all;
}
.text-container.line-clamp {
  line-clamp: var(--line-clamp);
  -webkit-line-clamp: var(--line-clamp);
}
</style>
