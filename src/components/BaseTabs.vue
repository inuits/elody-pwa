<template>
  <div class="h-full flex flex-col flex-shrink">
    <div class="flex justify-around">
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        @click="selectTab(index)"
        class="text-center w-full cursor-pointer py-2"
        :class="
          index === selectedIndex
            ? 'text-body bg-neutral-0 font-bold border-b-2'
            : 'text-body bg-neutral-0 text-light'
        "
      >
        {{ tab?.props?.title }}
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  provide,
  onMounted,
  onBeforeMount,
  toRefs,
} from "vue";
import type { VNode } from "vue";

interface TabProps {
  title?: string;
}

export default defineComponent({
  name: "BaseTabs",
  setup(props, { slots }) {
    const state = reactive({
      selectedIndex: 0,
      tabs: [] as VNode<TabProps>[],
      count: 0,
    });

    provide("TabsProvider", state);

    const selectTab = (i: number) => {
      state.selectedIndex = i;
    };

    onBeforeMount(() => {
      if (slots.default) {
        state.tabs = slots.default().filter((child: any) => {
          return child.type.name === "BaseTab";
        });
      }
    });

    onMounted(() => {
      selectTab(0);
    });

    return { ...toRefs(state), selectTab };
  },
});
</script>

<style scoped>
.text-light {
  color: var(--color-text-light);
}

.text-body {
  color: var(--color-text-body);
}
</style>
