<template>
  <div class="w-full h-full relative">
    <video class="w-full h-full bg-white" controls>
      <source
        :src="getVideoUrl()"
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

const getVideoUrl = (): string => {
  if (!props.source?.intialValues?.original_file_location)
    throw Error("original_file_location was not found on mediafile");

  return `/api/mediafile/${getMediafilePath(
    props.source?.intialValues?.original_file_location,
  )}`;
};
</script>
