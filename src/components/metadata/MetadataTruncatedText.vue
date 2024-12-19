<template>
  <div
    ref="textContainer"
    class="text-container"
    :style="{ '--line-clamp': clampLines }"
    :class="{ 'line-clamp': isClamped }"
  >
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from "vue";

const props = defineProps({
  clampLines: {
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
const isClamped = ref(false);
const lineHeight = 20;

const checkOverflow = async () => {
  if (props.disabled) return;

  await nextTick();
  if (textContainer.value) {
    const maxTotalHeight = lineHeight * 2;
    const isOverflowing = textContainer.value.clientHeight >= maxTotalHeight;
    isClamped.value = isOverflowing;
    emit("overflow-status", isOverflowing);
  }
};

onMounted(() => {
  checkOverflow();
});

watch(
  () => props.clampLines,
  () => {
    checkOverflow();
  },
);
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
