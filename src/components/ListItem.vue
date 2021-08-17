<template>
  <li
    class="
    flex justify-between px-8 py-4 bg-neutral-0 hover:bg-neutral-10 border border-neutral-30 mb-2 rounded cursor-pointer transition-colors duration-300 hover:shadow-sm
    "
    :class="{ 'animate-pulse': loading }"
  >
    <div class="flex w-full">
      <div
        v-for="metaItem in meta"
        :key="metaItem.value"
        class="flex justify-start flex-col px-1 w-1/4"
      >
        <span
          class="rounded text-xs"
          :class="{
            'bg-neutral-20 text-neutral-20': loading,
            'text-neutral-60': !loading,
          }"
          data-test="meta-label"
        >
          {{ metaItem.key }}
        </span>
        <span
          class="mt-0.5 rounded text-sm"
          :class="{
            'bg-neutral-20 text-neutral-20': loading,
            'text-neutral-700': !loading,
          }"
          data-test="meta-info"
        >
          {{ metaItem.value }}
        </span>
      </div>
    </div>
    <div class="flex flex-row" data-test="action-slot">
      <slot name="actions" />
    </div>
  </li>
</template>

<script lang="ts">
  import { Metadata } from '@/queries';
  import { defineComponent, PropType } from 'vue';

  export default defineComponent({
    name: 'ListItem',
    props: {
      loading: { type: Boolean, default: false },
      meta: { type: Array as PropType<Metadata[]>, default: () => [] },
    },
  });
</script>
