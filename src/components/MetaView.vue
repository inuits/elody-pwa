<template>
  <div class="w-2/6 p-6 bg-neutral-0">
    <div v-for="meta in metadata" :key="meta.value" class="flex flex-col mb-2 mt-2">
      <span
        class="rounded font-base text-xs"
        :class="{
          'bg-neutral-20 text-neutral-20': loading,
          'text-neutral-60': !loading,
        }"
        data-test="meta-label"
      >
        {{ meta.key }}
      </span>
      <span
        class="mt-0.5 rounded font-base text-sm"
        :class="{
          'bg-neutral-20 text-neutral-20': loading,
          'text-neutral-700': !loading,
        }"
        data-test="meta-info"
      >
        {{ meta.value }}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
  import { Metadata } from '@/queries';
  import { defineComponent, PropType } from 'vue';
  import { diff } from 'just-diff';

  export default defineComponent({
    name: 'MetaView',
    props: {
      loading: { type: Boolean, default: false },
      metadata: { type: Array as PropType<Metadata[]>, default: () => [] },
      editMode: { type: Boolean, default: false },
    },
    setup() {
      
    }
  });
</script>
