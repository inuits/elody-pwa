<template>
  <div v-show="isActive" class="flex flex-col flex-grow p-3">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { ref, watch, onBeforeMount, defineComponent, inject } from "vue";
export default defineComponent({
  name: "BaseTab",
  setup() {
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
    return { index, isActive };
  },
});
</script>

<style scoped></style>
