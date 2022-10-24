<template>
  <div class="w-full relative">
    <video class="w-full h-full" controls>
      <source :src="source && source?.original_file_location ? source?.original_file_location : 'no-src'" :type="source && source?.mimetype ? source?.mimetype : 'no-type'" />
    </video>
    <media-info class="right-0 mb-16" :meta-data="source.metadata" />
  </div>
</template>
<script lang="ts">
import type { MediaFile } from "@/queries";
import { defineComponent } from "vue";
import type { PropType } from "vue";
import MediaInfo from "./MediaInfo.vue";

export default defineComponent({
  name: "VideoPlayer",
  components: {
    MediaInfo,
  },
  props: {
    source: {
      type: Object as PropType<MediaFile>,
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>
