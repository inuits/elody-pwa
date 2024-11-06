<template>
  <div class="w-full h-full relative">
    <video
      class="w-full h-full bg-white"
      :src="videoUrl"
      controls
      refs="myVideo"
    >
      <source
        :src="videoUrl"
        :type="
          source && getValueOfMediafile(mediafileViewerContext, 'mimetype')
            ? getValueOfMediafile(mediafileViewerContext, 'mimetype')
            : 'no-type'
        "
      />
    </video>
  </div>
</template>
<script lang="ts" setup>
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import { onMounted, ref, inject } from "vue";
import { useGetMediafile } from "@/composables/useGetMediafile";

const props = defineProps<{
  source?: any;
}>();

const { getValueOfMediafile } = useEntityMediafileSelector();
const { getMediafile, getMediafilePath } = useGetMediafile();

const mediafileViewerContext: any = inject("mediafileViewerContext");

const videoUrl = ref("");

const getVideo = async () => {
  const response = await getMediafile(
    `/api/mediafile/${getMediafilePath(
      props.source?.intialValues?.originalFileLocation
    )}`
  );
  const videoBlob = await response.blob();

  videoUrl.value = URL.createObjectURL(videoBlob);
};

onMounted(() => {
  getVideo();
});
</script>
