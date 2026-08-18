<template>
  <div class="flex flex-col shrink bg-background-light">
    <ol
      v-if="stepStrip"
      data-testid="base-tabs-step-strip"
      class="flex items-center gap-2 ml-6 mb-6"
    >
      <li
        v-for="(tab, index) in tabs"
        :key="index"
        data-testid="base-tabs-step"
        class="flex items-center gap-2"
      >
        <span
          data-testid="base-tabs-step-circle"
          class="flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold"
          :class="
            index === state.selectedIndex
              ? 'bg-accent-accent text-neutral-white'
              : index < state.selectedIndex
                ? 'bg-accent-light text-accent-accent'
                : 'bg-background-normal text-text-light'
          "
        >
          {{ index + 1 }}
        </span>
        <span
          :class="
            index === state.selectedIndex ? 'font-bold' : 'text-text-light'
          "
        >
          {{ tab }}
        </span>
        <span
          v-if="index < tabs.length - 1"
          data-testid="base-tabs-step-separator"
          class="text-text-light px-1"
          >›</span
        >
      </li>
    </ol>
    <!-- Real tabs (dynamic-form.md): 12.5px bold labels, the active one
         underlined in the accent, an error tab marked with a danger dot. -->
    <div v-else role="tablist" class="flex gap-3">
      <button
        v-for="(tab, index) in tabs"
        :key="index"
        type="button"
        role="tab"
        data-testid="base-tabs-tab"
        :aria-selected="index === state.selectedIndex"
        :tabindex="index === state.selectedIndex ? 0 : -1"
        class="ds-tab"
        :class="[
          { 'ds-tab--active': index === state.selectedIndex },
          tabNavigationDisabled ? '' : 'cursor-pointer',
        ]"
        @click="selectTab(index)"
        @keydown.left.prevent="moveFocus(index - 1)"
        @keydown.right.prevent="moveFocus(index + 1)"
      >
        {{ tab }}
        <span
          v-if="errorTabs.includes(index)"
          class="ds-tab__error-dot"
          :title="errorDotTitle"
        />
      </button>
    </div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { reactive, provide } from "vue";

const props = withDefaults(
  defineProps<{
    tabs: string[];
    tabNavigationDisabled: boolean;
    stepStrip?: boolean;
    /** Indexes of tabs holding validation errors; each gets a danger dot. */
    errorTabs?: number[];
    errorDotTitle?: string;
  }>(),
  {
    tabs: () => [],
    tabNavigationDisabled: false,
    stepStrip: false,
    errorTabs: () => [],
    errorDotTitle: "",
  },
);

const state = reactive({
  selectedIndex: 0,
  tabs: props.tabs,
  count: 0,
});

provide("TabsProvider", state);

const selectTab = (i: number) => {
  if (props.tabNavigationDisabled) return;
  state.selectedIndex = i;
};

/** Arrow keys move and select, per the tabs pattern. */
const moveFocus = (i: number) => {
  if (props.tabNavigationDisabled) return;
  if (i < 0 || i >= props.tabs.length) return;
  selectTab(i);
};
</script>

<style scoped>
.ds-tab {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-ds-3);
  padding: var(--spacing-ds-5) var(--spacing-ds-6);
  font-size: var(--text-table);
  font-weight: 700;
  color: var(--color-text-secondary);
  border-bottom: 2px solid transparent;
}

.ds-tab--active {
  color: var(--color-text-body);
  border-bottom-color: var(--color-accent);
}

.ds-tab:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 1px;
}

.ds-tab__error-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--color-danger);
}
</style>
