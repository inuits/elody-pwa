<template>
  <div class="p-6 bg-neutral-0">
    <div v-for="item in metadata" :key="item.value" class="flex flex-col mb-2 mt-2">
      <span class="label" :class="{ loading }" data-test="meta-label">
        {{ item.key }}
      </span>
      <span class="value" :class="{ loading }" data-test="meta-info">
        {{ item.value }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
  import { Metadata } from '@/queries';
  import { defineComponent, PropType } from 'vue';

  export default defineComponent({
    name: 'MetaView',
    props: {
      loading: { type: Boolean, default: false },
      metadata: { type: Array as PropType<Metadata[]>, required: true },
    },
  });
</script>

<style lang="postcss" scoped>
  .label {
    @apply rounded font-body text-xs text-neutral-60;
  }
  .value {
    @apply rounded font-body text-sm text-neutral-700 mt-0.5;
  }
  .label.loading,
  .value.loading {
    @apply bg-neutral-20 text-neutral-20;
  }
</style>
