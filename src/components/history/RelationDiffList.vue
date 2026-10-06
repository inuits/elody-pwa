<template>
  <div class="flex flex-wrap gap-2">
    <span
      v-for="item in visibleItems"
      :key="item.key"
      :class="[
        'rounded-full px-2 py-1 text-sm',
        {
          'bg-green-100 text-green-800':
            item.status === 'added' ||
            (item.status === 'renamed' && item.variant === 'current'),
          'bg-red-100 text-red-800 line-through': item.status === 'removed',
          'bg-red-100 text-red-800':
            item.status === 'renamed' && item.variant === 'previous',
          'bg-gray-100 text-gray-800': item.status === 'unchanged',
        },
      ]"
    >
      {{ item.label
      }}<template v-if="item.status === 'renamed'">
        · {{ t("history.renamed") }}</template
      >
    </span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

type RelationDiffListItem = {
  key: string;
  label: string;
  status: "added" | "removed" | "unchanged" | "renamed";
  variant?: "current" | "previous";
};

const props = defineProps<{
  items: RelationDiffListItem[];
}>();

const { t } = useI18n();

const hasNoResolvedLabel = (item: RelationDiffListItem) =>
  !item.label || item.label === item.key;

const visibleItems = computed(() =>
  props.items.filter(
    (item) => item.status !== "unchanged" || !hasNoResolvedLabel(item),
  ),
);
</script>
