<template>
  <history-element-wrapper :label="label">
    <relation-diff-list v-if="items.length" :items="items" />
    <p v-else class="text-text-light text-sm">
      {{ $t("history.no-items") }}
    </p>
  </history-element-wrapper>
</template>

<script lang="ts" setup>
import HistoryElementWrapper from "@/components/history/HistoryElementWrapper.vue";
import RelationDiffList from "@/components/history/RelationDiffList.vue";
import type { RelationDiffItem } from "@/composables/useHistoryComparisonData";

defineProps<{
  label?: string | null;
  items: RelationDiffItem[];
}>();
</script>
