<template>
  <div class="flex flex-col shrink bg-background-light">
    <div class="flex gap-3">
      <div
        v-for="(tab, index) in tabs"
        :key="index"
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
  }>(),
  {
    tabs: () => [],
    tabNavigationDisabled: false,
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
