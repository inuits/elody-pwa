<template>
  <ul class="border-neutral-700 animate-pulse">
    <li
      data-test="li-tree"
      class="text-neutral-700 font-bold flex items-center relative flex-grow justify-between bg-neutral-20 border-neutral-50 border-r-4 h-20 rounded-sm my-2"
    >
      <div class="w-40 h-4 ml-4 bg-neutral-30"></div>
    </li>
    <li
      data-test="li-tree"
      class="text-neutral-700 font-bold flex items-center relative flex-grow justify-between bg-neutral-20 border-neutral-50 border-r-4 h-20 rounded-sm my-2"
    >
      <div class="w-40 h-4 ml-4 bg-neutral-30"></div>
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "LoadingList",
  props: {},
  setup() {
    return {};
  },
});
</script>
