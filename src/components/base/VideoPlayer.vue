<template>
  <div class="w-full relative">
    <video class="w-full h-full" controls>
      <source :src="source?.original_file_location" :type="source?.mimetype" />
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
      type: Array as PropType<MediaFile[]>,
      required: true,
    },
  },
  setup() {
    return {};
  },
});
</script>
