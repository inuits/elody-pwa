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
  </div>
</template>
<script lang="ts">
import type { MediaFile } from "../../generated-types/queries";
import { defineComponent } from "vue";
import type { PropType } from "vue";

export default defineComponent({
  name: "AudioPlayer",
  components: {},
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
