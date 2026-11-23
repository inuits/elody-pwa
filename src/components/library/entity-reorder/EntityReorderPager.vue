<template>
  <div class="flex items-center gap-1 min-h-11">
    <span class="flex-1 text-label text-text-muted">
      {{ firstPosition }}–{{ lastPosition }} / {{ total }}
    </span>
    <button
      v-for="pageIndex in pageIndexes"
      :key="pageIndex"
      type="button"
      class="min-w-9 h-9 px-2 border border-border-default rounded-button font-bold cursor-pointer"
      :class="pageButtonClasses(pageIndex)"
      :aria-current="pageIndex === page ? 'page' : undefined"
      @click="emit('goTo', pageIndex)"
      @dragover="(event) => allowDrop(event, pageIndex)"
      @drop.prevent="emit('drop', pageIndex)"
    >
      {{ pageIndex + 1 }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps<{
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  dragging: boolean;
}>();

const emit = defineEmits<{
  (event: "goTo", pageIndex: number): void;
  (event: "drop", pageIndex: number): void;
}>();

const pageIndexes = computed(() =>
  Array.from({ length: props.pageCount }, (_, pageIndex) => pageIndex),
);
const firstPosition = computed(() => props.page * props.pageSize + 1);
const lastPosition = computed(() =>
  Math.min((props.page + 1) * props.pageSize, props.total),
);

const pageButtonClasses = (pageIndex: number) => {
  const styles = {
    current: "bg-accent text-text-on-accent",
    dropTarget: "bg-accent-wash",
    idle: "bg-surface",
  };
  if (pageIndex === props.page) return styles.current;
  if (props.dragging) return styles.dropTarget;
  return styles.idle;
};

const allowDrop = (event: DragEvent, pageIndex: number) => {
  if (props.dragging && pageIndex !== props.page) event.preventDefault();
};
</script>
