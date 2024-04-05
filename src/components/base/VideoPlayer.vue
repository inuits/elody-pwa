<template>
  <div class="w-full relative">
    <video class="w-full h-full" controls @error="handleError1">
      <source
        :src="source && fileName ? '/api/mediafile/' + fileName : 'no-src'"
        :type="
          source && getValueOfMediafile('mimetype')
            ? getValueOfMediafile('mimetype')
            : 'no-type'
        "
        @error="handleError"
      />
    </video>
  </div>
</template>
<script lang="ts" setup>
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import useHttpErrors from "@/composables/useHttpErrors";

defineProps<{
  source?: any;
}>();

const { getValueOfMediafile } = useEntityMediafileSelector();
const fileName =
  getValueOfMediafile("filename") || getValueOfMediafile("transcode_filename");
const { logFormattedErrors } = useHttpErrors();

const handleError = (event: any) => {
  console.log(event.target.parentNode.error);
  console.log(event.target.parentNode.networkState);
}

const handleError1 = (event: any) => {
  console.log(event.target.parentNode.error);
  console.log(event.target.parentNode.networkState);
}
</script>
