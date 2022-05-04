<template>
  <video class="w-full h-full" controls>
    <source :src="source?.original_file_location" :type="source?.mimetype" />
  </video>
  <media-info class="" :meta-data="source.metadata" />
</template>
<script lang="ts">
  import { MediaFile } from '@/queries';
  import { defineComponent, PropType } from 'vue';
  import MediaInfo from './MediaInfo.vue';

  export default defineComponent({
    name: 'VideoPlayer',
    components: {
      MediaInfo,
    },
    props: {
      source: {
        type: Array as PropType<MediaFile[]>,
        required: true,
      },
    },
    setup() {
      return {};
    },
  });
</script>
