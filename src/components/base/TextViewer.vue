<template>
  <div class="flex w-full h-full justify-center items-center">
    <media-info :meta-data="source.metadata" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import MediaInfo from "./MediaInfo.vue";

export default defineComponent({
  name: "TextViewer",
  components: {
    MediaInfo,
  },
  props: {
    source: {
      type: Object,
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>
