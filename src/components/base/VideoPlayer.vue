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
import { onMounted } from "vue";

defineProps<{
  source?: any;
}>();

const { getValueOfMediafile } = useEntityMediafileSelector();
const fileName =
  getValueOfMediafile("filename") || getValueOfMediafile("transcode_filename");

let video = "no-src";
const getVideo = async () => {
  const response = await fetch(`/api/mediafile/${fileName}`, {
    method: "GET",
  });

  if (!response.ok) {
    return Promise.reject(response);
  }

  console.log(response);

  // return JSON.parse(await response.text());
};

onMounted(() => {
  getVideo();
});
</script>
