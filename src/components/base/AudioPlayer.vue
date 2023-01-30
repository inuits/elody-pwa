<template>
  <div class="flex w-full h-full justify-center items-center">
    <audio controls class="w-full">
      <source
        :src="
          source && source?.filename
            ? '/api/mediafile/' + source.filename
            : 'no-src'
        "
        :type="source && source?.mimetype ? source?.mimetype : 'no-type'"
      />
      {{ $t("audio.no-support") }}
    </audio>
    <media-info class="" :meta-data="source.metadata" />
  </div>
</template>
<script lang="ts">
import type {
  MediaFile,
  MediaFileMetadata,
} from "../../generated-types/queries";
import { defineComponent } from "vue";
import type { PropType } from "vue";
import MediaInfo from "./MediaInfo.vue";

export default defineComponent({
  name: "AudioPlayer",
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
