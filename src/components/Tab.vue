<template>
  <div v-show="isActive" style="height: -webkit-calc(100% - 40px)">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { ref, watch, onBeforeMount, defineComponent, inject } from "vue";
export default defineComponent({
  name: "Tab",
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
