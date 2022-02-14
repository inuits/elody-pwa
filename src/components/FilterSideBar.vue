<template>
  <div class="w-2/6 border-l-2 border-r-2 border-solid border-neutral-30">
    <div>
      <div class="flex justify-between m-3">
        <p class="text-xl font-medium">Filter</p>
        <p class="bg-blue-50 text-blue-300 rounded-md px-2 py-1">
          {{ activeCount }} actief
        </p>
      </div>
      <div
        class="flex justify-between border-solid border-b-2 border-neutral-30 px-3 pb-3"
      >
        <p class="bg-blue-50 hover:bg-blue-75 text-blue-300 rounded-md">ph4switch</p>
        <button class="bg-blue-50 hover:bg-blue-75 text-blue-300 p-2 rounded-md">
          Clear all
        </button>
        <button
          class="bg-blue-400 hover:bg-blue-300 text-neutral-0 px-16 py-2 rounded-md"
        >
          Apply Filters
        </button>
      </div>
    </div>
    <div></div>
  </div>
</template>
<script lang="ts">
  import { defineComponent, watch, ref } from 'vue';

  export default defineComponent({
    setup() {
      const selectedFilters = ref([]);
      const activeCount = ref(0);
      watch(
        selectedFilters,
        () => {
          activeCount.value = selectedFilters.value.length;
        },
        { immediate: true },
      );
      return { activeCount };
    },
  });
</script>
