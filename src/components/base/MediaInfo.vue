<template>
  <div
    :v-show="props.imageMetaData.length > 0"
    class="metainfo absolute bg-neutral-0 z-20 mx-4 mt-7 p-4 shadow-sm bottom-0"
  >
    <h3 class="text-sm text-neutral-700 font-semibold">Mediainfo</h3>
    <div
      :key="item.label"
      :v-for="item in props.imageMetaData"
      class="flex flex-col mb-2 mt-2"
    >
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
      imageMetaData: {
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
