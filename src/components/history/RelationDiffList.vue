<template>
  <div class="flex flex-wrap gap-2">
    <span
      v-for="item in visibleItems"
      :key="item.key"
      data-cy="relation-diff-chip"
      :class="['rounded-chip text-chip p-(--chip-padding)', toneFor(item)]"
    >
      <span v-if="announcementFor(item)" class="sr-only">{{
        announcementFor(item)
      }}</span>
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

const { t, te } = useI18n();

// Semantic diff colours: green for new/added, red for old/removed.
const toneFor = (item: RelationDiffListItem): string => {
  if (
    item.status === "added" ||
    (item.status === "renamed" && item.variant === "current")
  )
    return "bg-diff-new-bg text-diff-new";
  if (item.status === "removed" || item.status === "renamed")
    return "bg-diff-old-bg text-diff-old";
  return "bg-chip-neutral-bg text-chip-neutral-text";
};

// The change must not rely on colour alone.
const translated = (key: string, fallback: string): string =>
  te(key) ? t(key) : fallback;
const announcementFor = (item: RelationDiffListItem): string | undefined => {
  if (item.status === "added") return translated("history.added", "added");
  if (item.status === "removed")
    return translated("history.removed", "removed");
  return undefined;
};

const hasNoResolvedLabel = (item: RelationDiffListItem) =>
  !item.label || item.label === item.key;

const visibleItems = computed(() =>
  props.items.filter(
    (item) => item.status !== "unchanged" || !hasNoResolvedLabel(item),
  ),
);
</script>
