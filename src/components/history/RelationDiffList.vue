<template>
  <div class="flex flex-wrap gap-2">
    <span
      v-for="item in visibleItems"
      :key="item.key"
      :class="[
        'rounded-full px-2 py-1 text-sm',
        {
          'bg-green-100 text-green-800': item.status === 'added',
          'bg-red-100 text-red-800 line-through': item.status === 'removed',
          'bg-gray-100 text-gray-800': item.status === 'unchanged',
        },
      ]"
    >
      {{ item.label }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

type RelationDiffListItem = {
  key: string;
  label: string;
  status: "added" | "removed" | "unchanged";
};

const props = defineProps<{
  items: RelationDiffListItem[];
}>();

const hasNoResolvedLabel = (item: RelationDiffListItem) =>
  !item.label || item.label === item.key;

const visibleItems = computed(() =>
  props.items.filter(
    (item) => item.status !== "unchanged" || !hasNoResolvedLabel(item),
  ),
);
</script>
