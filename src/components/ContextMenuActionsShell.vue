<template>
  <div class="flex items-center justify-center pl-2 gap-2">
    <div
      v-if="hasPromotedActions"
      class="flex items-center gap-1 pr-2"
      @click.stop
    >
      <slot name="promoted" />
    </div>
    <div
      v-if="primaryLabel || hasOverflowActions"
      class="flex items-stretch"
      @click.stop
    >
      <!-- Split-button anatomy: accent-filled primary + caret sharing one
           surface; the overflow trigger is ALWAYS labelled. -->
      <button
        v-if="primaryLabel"
        type="button"
        data-cy="split-button-primary"
        class="rounded-l-md bg-accent px-3 py-0.5 text-xs font-bold text-neutral-white whitespace-nowrap cursor-pointer hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-accent-accent disabled:opacity-45 disabled:cursor-not-allowed"
        :class="{ 'rounded-r-md': !hasOverflowActions }"
        :disabled="primaryDisabled"
        :title="primaryDisabled ? primaryDisabledReason : undefined"
        @click.stop.prevent="emit('primary')"
      >
        {{ primaryLabel }}
      </button>
      <template v-if="hasOverflowActions">
        <button
          type="button"
          data-cy="split-button-caret"
          aria-haspopup="menu"
          aria-expanded="false"
          :aria-label="caretAriaLabel"
          class="flex items-center py-0.5 text-xs font-bold whitespace-nowrap cursor-pointer focus-visible:outline-2 focus-visible:outline-accent-accent"
          :class="
            primaryLabel
              ? 'rounded-r-md bg-accent px-1 text-neutral-white border-l border-neutral-white/40 hover:bg-accent-hover'
              : 'rounded-md border border-neutral-40 bg-neutral-white px-3 text-text-body hover:bg-accent-wash'
          "
          @click.stop.prevent="openContextMenu"
        >
          <span v-if="!primaryLabel">{{ effectiveMenuLabel }}</span>
          <unicon :name="Unicons.AngleDown.name" height="16" />
        </button>
        <base-context-menu :context-menu="contextMenuHandler.getContextMenu()">
          <slot name="overflow" />
        </base-context-menu>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { ContextMenuHandler } from "@/components/context-menu-actions/ContextMenuHandler";
import BaseContextMenu from "@/components/base/BaseContextMenu.vue";
import { Unicons } from "@/types";

const props = withDefaults(
  defineProps<{
    hasPromotedActions: boolean;
    hasOverflowActions: boolean;
    // Split-button anatomy: a labeled, always-visible primary action with
    // the overflow menu behind a caret. Without labels the trigger still
    // shows a translated "Actions" label — never a bare ⋮.
    primaryLabel?: string;
    primaryDisabled?: boolean;
    primaryDisabledReason?: string;
    menuLabel?: string;
    // Scopes the caret's accessible name, e.g. the row's entity title.
    menuScopeLabel?: string;
  }>(),
  {
    primaryLabel: undefined,
    primaryDisabled: false,
    primaryDisabledReason: undefined,
    menuLabel: undefined,
    menuScopeLabel: undefined,
  },
);

const emit = defineEmits<{
  (event: "primary"): void;
}>();

const { t, te } = useI18n();

const contextMenuHandler = ref<ContextMenuHandler>(new ContextMenuHandler());

const effectiveMenuLabel = computed<string>(
  () =>
    props.menuLabel ??
    (te("library.actions-column") ? t("library.actions-column") : "Actions"),
);

// "Meer acties voor {titel}" when a scope label is known.
const caretAriaLabel = computed<string>(() => {
  const base = te("context-menu.more-actions")
    ? t("context-menu.more-actions")
    : "More actions";
  return props.menuScopeLabel
    ? `${base} — ${props.menuScopeLabel}`
    : (props.menuLabel ?? base);
});

const openContextMenu = (event: Event) => {
  contextMenuHandler.value.openContextMenu(
    {
      x: (event as MouseEvent)?.clientX,
      y: (event as MouseEvent)?.clientY,
    },
    event.currentTarget,
  );
};
</script>
