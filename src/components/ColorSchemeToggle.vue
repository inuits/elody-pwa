<template>
  <button
    type="button"
    data-cy="color-scheme-toggle"
    :aria-label="isExpanded ? undefined : label"
    :class="buttonClasses"
    @click="toggleColorScheme"
  >
    <unicon
      :name="isDark ? 'sun' : 'moon'"
      :height="isExpanded ? 20 : 18"
      aria-hidden="true"
    />
    <span v-if="isExpanded">{{ label }}</span>
  </button>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useColorScheme } from "@/composables/useColorScheme";

// Expanded: an icon + label row, like the drawer's log-out row
const props = defineProps<{ isExpanded?: boolean }>();

const { t } = useI18n();
const { isDark, toggleColorScheme } = useColorScheme();

// Names the action: the scheme a click switches to
const label = computed(() =>
  t(isDark.value ? "navigation.light-mode" : "navigation.dark-mode"),
);

const buttonClasses = computed(() => [
  "flex items-center rounded-(--nav-rail-item-radius) text-text-muted cursor-pointer hover:bg-accent-highlight",
  props.isExpanded
    ? "w-full min-h-(--nav-rail-item-height) px-2 gap-2 text-table"
    : "justify-center shrink-0 size-(--control-height)",
]);
</script>
