<template>
  <video class="w-full h-full" controls>
    <source
      :src="'https://coghent-api-dev.inuits.dev/storage/v1/download/' + props.uri"
      type="video/mp4"
    />
  </video>
</template>
<script>
  import { defineComponent } from 'vue';
  export default defineComponent({
    name: 'VideoPlayer',
    props: {
      uri: {
        type: String,
        required: false,
        default: '',
      },
    },
    setup(props) {
      return { props };
    },
  });
</script>
