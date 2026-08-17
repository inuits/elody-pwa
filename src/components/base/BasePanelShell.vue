<template>
  <section class="panel-shell" :role="landmark" :aria-labelledby="headingId">
    <header class="panel-shell__header">
      <component :is="headingLevel" :id="headingId" class="panel-shell__title">
        {{ title }}
      </component>
      <div v-if="$slots.status" class="panel-shell__status">
        <slot name="status" />
      </div>
      <div class="panel-shell__actions">
        <slot name="actions" />
      </div>
    </header>
    <slot />
  </section>
</template>

<script lang="ts" setup>
import { useId } from "vue";

/**
 * The one panel chrome in the system: an 8px card with a 1px panel border and
 * no shadow, topped by an accent-light header carrying the title and an
 * actions slot (panel-and-block-shells.md).
 *
 * Both header colours are client-themed, so a dark-accent tenant flips the
 * title ink to white without this component knowing anything about it.
 */
const {
  title,
  headingLevel = "h3",
  landmark = "region",
} = defineProps<{
  title: string;
  /** h2 for a section, h3 for a panel, h4 for a block — never skip a level. */
  headingLevel?: "h2" | "h3" | "h4";
  /**
   * A detail-screen panel is a region; the preview beside a list is
   * complementary, because it supports the list rather than being part of it.
   */
  landmark?: "region" | "complementary";
}>();

const headingId = `panel-shell-${useId()}`;
</script>

<style scoped>
.panel-shell {
  border: 1px solid var(--color-border-panel);
  border-radius: var(--radius-card);
  background-color: var(--color-surface);
  /* Panels never float: only overlays do. */
  box-shadow: none;
}

.panel-shell__header {
  display: flex;
  align-items: center;
  gap: var(--spacing-ds-6);
  padding: var(--spacing-ds-8) var(--spacing-ds-11);
  background-color: var(--color-surface-panel-header);
  border-radius: var(--radius-card) var(--radius-card) 0 0;
}

.panel-shell__title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: var(--text-body);
  font-weight: 700;
  color: var(--color-text-panel-header);
}

.panel-shell__status {
  flex: none;
}

.panel-shell__actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-ds-5);
  margin-left: auto;
  flex: none;
}

.panel-shell__actions > :deep(.ds-button) {
  flex: none;
  width: auto;
}
</style>
