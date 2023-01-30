<template>
  <div class="w-full relative">
    <video class="w-full h-full" controls>
      <source
        :src="
          source && (source?.transcode_filename || source?.filename)
            ? '/api/mediafile/' + source.transcode_filename || source.filename
            : 'no-src'
        "
        :type="source && source?.mimetype ? source?.mimetype : 'no-type'"
      />
    </video>
    <media-info class="right-0 mb-16" :meta-data="source.metadata" />
  </div>
</template>
<script lang="ts">
import type { MediaFile } from "../../generated-types/queries";
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
