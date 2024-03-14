<template>
  <div class="w-full relative">
    <video class="w-full h-full" controls>
      <source
        :src="
          source && (getValueOfMediafile('transcode_filename') || getValueOfMediafile('filename'))
            ? '/api/mediafile/' + getValueOfMediafile('transcode_filename') || getValueOfMediafile('filename')
            : 'no-src'
        "
        :type="source && getValueOfMediafile('mimetype') ? getValueOfMediafile('mimetype') : 'no-type'"
      />
    </video>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import type { PropType } from "vue";
import { useAuth } from "session-vue-3-oidc-library";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";

export default defineComponent({
  name: "VideoPlayer",
  components: {},
  props: {
    source: {
      type: Object as PropType<any>,
      required: true,
    },
  },
  setup(props) {
    const { getValueOfMediafile } = useEntityMediafileSelector();
    const auth = useAuth();
    const fileName = props.source?.initialValues?.['transcode_filename'] || props.source?.initialValues?.['transcode_filename']
    return {
      getValueOfMediafile
    };
  },
});
</script>
