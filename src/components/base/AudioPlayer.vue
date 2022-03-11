<template>
  <div class="flex w-full h-full justify-center items-center">
    <audio controls class="w-full">
      <source
        :src="'https://coghent-api-dev.inuits.dev/storage/v1/download/' + props.source"
        type="audio/mpeg"
      />
      Your browser does not support the audio element.
    </audio>
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'AudioPlayer',
    props: {
      source: {
        type: String,
        default: '',
        required: false,
      },
    },

    setup(props) {
      return { props };
    },
  });
</script>
