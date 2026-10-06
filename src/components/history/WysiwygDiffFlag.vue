<template>
  <div class="flex items-center gap-2">
    <span class="font-medium">{{ label }}:</span>
    <span
      :class="[
        'rounded-chip text-chip p-(--chip-padding)',
        changed
          ? 'bg-diff-new-bg text-diff-new'
          : 'bg-chip-neutral-bg text-chip-neutral-text',
      ]"
    >
      {{ changed ? changedLabel : unchangedLabel }}
    </span>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t, te } = useI18n();
const changedLabel = computed(() =>
  te("history.changed") ? t("history.changed") : "Changed",
);
const unchangedLabel = computed(() =>
  te("history.unchanged") ? t("history.unchanged") : "Unchanged",
);

defineProps<{
  label: string;
  changed: boolean;
}>();
</script>
