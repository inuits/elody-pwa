<template>
  <div class="w-full relative">
    <video class="w-full h-full" :src="videoUrl" controls refs="myVideo">
      <source
        :src="videoUrl"
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
import { onMounted, ref } from "vue";
import { useGetMediafile } from "@/composables/useGetMediafile";

defineProps<{
  source?: any;
}>();

const { getValueOfMediafile } = useEntityMediafileSelector();
const fileName =
  getValueOfMediafile("filename") || getValueOfMediafile("transcode_filename");
const { getMediafile } = useGetMediafile();

const videoUrl = ref("");

const getVideo = async () => {
  const response = await getMediafile(`/api/mediafile/${fileName}`);
  const videoBlob = await response.blob();

  videoUrl.value = URL.createObjectURL(videoBlob);
};

onMounted(() => {
  getVideo();
});
</script>
