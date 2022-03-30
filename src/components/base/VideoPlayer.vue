<template>
  <video class="w-full h-full" controls>
    <source
      :src="'https://coghent-api-dev.inuits.dev/storage/v1/download/' + source.filename"
      type="video/mp4"
    />
  </video>
  <media-info class="" :meta-data="source.metadata" />
</template>
<script lang="ts">
  import { MediaFileMetadata } from '@/queries';
  import { defineComponent, PropType } from 'vue';
  import MediaInfo from './MediaInfo.vue';

  export default defineComponent({
    name: 'VideoPlayer',
    components: {
      MediaInfo,
    },
    props: {
      source: {
        type: Array as PropType<MediaFileMetadata[]>,
        required: true,
      },
    },
    setup() {
      return {};
    },
  });
</script>
