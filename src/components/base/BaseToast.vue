<template>
  <!--
    The toast (feedback.md): inverted surface, white 12.5px text, 10px radius,
    toast shadow. Status toasts are polite; errors are alerts and never
    auto-dismiss, which the composable enforces. Escape on a focused toast
    dismisses it; focus is never trapped.
  -->
  <div
    class="ds-toast"
    :class="`ds-toast--${type}`"
    :role="type === 'error' ? 'alert' : 'status'"
    tabindex="-1"
    @keydown.escape="$emit('close')"
  >
    <div class="ds-toast__body">
      <p v-if="title" class="ds-toast__title">{{ title }}</p>
      <p v-if="text" class="ds-toast__text">{{ text }}</p>
    </div>
    <button
      v-if="actionLabel"
      type="button"
      class="ds-toast__action"
      @click="$emit('action')"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>

<script lang="ts" setup>
withDefaults(
  defineProps<{
    type?: "success" | "warn" | "error";
    title?: string;
    text?: string;
    /** The undo-toast is only for removals; saves carry the inline chip. */
    actionLabel?: string;
  }>(),
  { type: "success" },
);

defineEmits<{
  (event: "action"): void;
  (event: "close"): void;
}>();
</script>

<style scoped>
.ds-toast {
  display: flex;
  align-items: center;
  gap: var(--spacing-ds-8);
  max-width: 420px;
  margin: var(--spacing-ds-4);
  padding: var(--spacing-ds-6) var(--spacing-ds-9);
  border-radius: var(--radius-overlay);
  background-color: var(--color-surface-inverted);
  color: var(--color-text-on-inverted);
  box-shadow: var(--shadow-toast);
}

/* The accent bar marks severity; the surface stays the one toast surface. */
.ds-toast--error {
  border-left: 3px solid var(--color-danger);
}

.ds-toast--warn {
  border-left: 3px solid var(--color-warning-chip);
}

.ds-toast__body {
  min-width: 0;
}

.ds-toast__title {
  font-size: var(--text-table);
  font-weight: 700;
}

.ds-toast__text {
  font-size: var(--text-table);
}

.ds-toast__action {
  flex: none;
  font-size: var(--text-table);
  font-weight: 700;
  color: var(--color-accent-on-inverted);
  text-decoration: underline;
  border-radius: var(--radius-input);
  cursor: pointer;
}

.ds-toast__action:focus-visible {
  outline: 2px solid var(--color-accent-on-inverted);
  outline-offset: 1px;
}
</style>
