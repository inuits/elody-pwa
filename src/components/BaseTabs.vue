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
    <div v-else class="flex gap-3">
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        data-testid="base-tabs-tab"
        @click="selectTab(index)"
        class="text-center p-3"
        :class="[
          index === state.selectedIndex
            ? 'text-text-body font-bold border-b-2'
            : 'text-text-light',
          tabNavigationDisabled ? '' : 'cursor-pointer',
        ]"
      >
        {{ tab }}
      </div>
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
  }>(),
  {
    tabs: () => [],
    tabNavigationDisabled: false,
    stepStrip: false,
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
</script>
