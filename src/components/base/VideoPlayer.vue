<template>
  <div class="w-full relative">
    <video class="w-full h-full" controls>
      <source
        :src="source && fileName ? '/api/mediafile/' + fileName : 'no-src'"
        :type="
          source && getValueOfMediafile('mimetype')
            ? getValueOfMediafile('mimetype')
            : 'no-type'
        "
      />
    </video>
  </div>
</template>
<script lang="ts" setup>
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";

defineProps<{
  source?: any;
}>();

const { getValueOfMediafile } = useEntityMediafileSelector();
const fileName =
  getValueOfMediafile("filename") || getValueOfMediafile("transcode_filename");
</script>
