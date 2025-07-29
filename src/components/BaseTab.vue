<template>
  <div
    v-show="isActive"
    class="flex flex-col h-full p-3 bg-[var(--color-background-normal)]"
  >
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onBeforeMount, inject } from "vue";

const index = ref(0);
const isActive = ref(false);

const tabs: any = inject("TabsProvider");

watch(
  () => tabs.selectedIndex,
  () => {
    isActive.value = index.value === tabs.selectedIndex;
  }
);

onBeforeMount(() => {
  index.value = tabs.count;
  tabs.count++;
  isActive.value = index.value === tabs.selectedIndex;
});
</script>
