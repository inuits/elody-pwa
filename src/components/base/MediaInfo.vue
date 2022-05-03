<template>
  <div
    v-show="metaData.length > 0"
    class="metainfo absolute bg-neutral-0 z-20 mx-4 mt-7 p-4 shadow-sm bottom-0"
  >
    <h3 class="text-sm text-neutral-700 font-semibold">Mediainfo</h3>
    <div v-for="item in metaData" :key="item.key" class="flex flex-col mb-2 mt-2">
      <div class="label">{{ item.key }}</div>
      <div v-if="item.value" class="value">
        {{ item.value }}
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import { MediaFileMetadata } from '@/queries';
  import { defineComponent, PropType } from 'vue';

  export default defineComponent({
    name: 'MediaInfo',
    props: {
      metaData: {
        type: Array as PropType<MediaFileMetadata[]>,
        required: false,
        default: () => [],
      },
    },
    setup(props) {
      return { props };
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

  .metainfo {
    bottom: 1rem;
  }
</style>
