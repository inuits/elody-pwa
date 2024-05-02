<template>
  <div class="flex flex-col flex-shrink bg-neutral-0">
    <div class="flex gap-3">
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        @click="selectTab(index)"
        class="text-center cursor-pointer p-3"
        :class="
          index === state.selectedIndex
            ? 'text-text-body font-bold border-b-2'
            : 'text-text-light'
        "
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
  }>(),
  { tabs: [] }
);

const state = reactive({
  selectedIndex: 0,
  tabs: props.tabs,
  count: 0,
});

provide("TabsProvider", state);

const selectTab = (i: number) => {
  state.selectedIndex = i;
};
</script>
