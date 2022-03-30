<template>
  <div class="flex w-full h-full justify-center items-center">
    <audio controls class="w-full">
      <source
        :src="'https://coghent-api-dev.inuits.dev/storage/v1/download/' + source.filename"
        type="audio/mpeg"
      />
      Your browser does not support the audio element.
    </audio>
    <media-info class="" :meta-data="source.metadata" />
  </div>
</template>
<script lang="ts">
  import { MediaFileMetadata } from '@/queries';
  import { defineComponent, PropType } from 'vue';
  import MediaInfo from './MediaInfo.vue';

  export default defineComponent({
    name: 'AudioPlayer',
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
