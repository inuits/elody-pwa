<template>
  <div ref="parentRef" :style="containerStyleComputed">
    <div
      :style="{ height: `${totalSize}px`, width: '100%', position: 'relative' }"
    >
      <div
        v-for="virtualRow in virtualRows"
        :key="virtualRow.index"
        :ref="measureElement"
        :data-index="virtualRow.index"
        :style="{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${virtualRow.start}px)`,
        }"
      >
        <slot
          :item="items[virtualRow.index]"
          :index="virtualRow.index"
          :style="{
            width: '100%',
            overflowAnchor: 'none',
          }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, type ComponentPublicInstance } from "vue";
import { useVirtualizer } from "@tanstack/vue-virtual";

interface Props<T = unknown> {
  items: T[];
  itemSize?: number | ((index: number) => number);
  height?: string;
  width?: string;
  overscan?: number;
  dynamicHeight?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  itemSize: 62,
  height: "80vh",
  width: "100%",
  dynamicHeight: false,
});

const parentRef = ref<HTMLElement | null>(null);
const itemCount = computed(() => props.items.length);

const rowVirtualizer = useVirtualizer({
  count: itemCount.value,
  getScrollElement: () => parentRef.value,
  estimateSize:
    typeof props.itemSize === "function"
      ? props.itemSize
      : () => props.itemSize as number,
  overscan: props.overscan || 20,
  ...(props.dynamicHeight && {
    measureElement: (el: Element | undefined) => {
      if (!el) return 0;
      return el.getBoundingClientRect().height;
    },
  }),
});

watch(
  () => props.items.length,
  () => {
    if (rowVirtualizer.value) {
      rowVirtualizer.value.measure();
    }
  },
);

const measureElement = (el: Element | ComponentPublicInstance | null) => {
  if (!props.dynamicHeight || !el) return;

  const element =
    el instanceof Element ? el : (el as ComponentPublicInstance)?.$el;

  requestAnimationFrame(() => {
    if (rowVirtualizer.value && element) {
      rowVirtualizer.value.measureElement(element);
    }
  });
};

const virtualRows = computed(() => {
  const virtualizer = rowVirtualizer;
  return virtualizer ? virtualizer.value?.getVirtualItems() : [];
});

const totalSize = computed(() => {
  const virtualizer = rowVirtualizer;
  return virtualizer ? virtualizer.value?.getTotalSize() : 0;
});

const containerStyleComputed = computed(() => ({
  maxHeight: props.height,
  width: props.width,
  overflow: "auto",
  willChange: "transform",
}));
</script>
