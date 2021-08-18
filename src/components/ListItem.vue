<template>
  <li class="row" :class="{ loading }">
    <div class="flex w-full">
      <div v-for="metaItem in meta" :key="metaItem.value" class="col">
        <span class="label" data-test="meta-label">{{ metaItem.key }}</span>
        <span class="info" data-test="meta-info">{{ metaItem.value }}</span>
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

<style lang="postcss" scoped>
  .row {
    @apply flex justify-between px-8 py-4;
    @apply bg-neutral-0 hover:bg-neutral-10;
    @apply border border-neutral-30 mb-2 rounded cursor-pointer;
    @apply transition-colors duration-300 hover:shadow-sm;
  }
  .col {
    @apply flex justify-start flex-col px-1 w-1/4;
  }
  .label {
    @apply rounded text-xs text-neutral-60;
  }
  .info {
    @apply mt-0.5 rounded text-sm text-neutral-700;
  }
  .row.loading {
    @apply animate-pulse;
    .col span {
      @apply bg-neutral-20 text-neutral-20;
    }
  }
</style>
