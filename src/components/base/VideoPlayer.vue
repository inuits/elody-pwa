<template>
  <div class="w-full h-full relative">
    <video class="w-full h-full bg-white" preload="auto" controls>
      <source :src="getVideoUrl()" :type="mimetype" />
      Video not supported
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

const mimetype = ref<string>(
  getValueOfMediafile(mediafileViewerContext, "mimetype") || "no-type",
);

const getVideoUrl = (): string => {
  const fileLocationValues: string[] = [
    "transcode_file_location",
    "original_file_location",
  ];
  const fileLocation = fileLocationValues.find(
    (locationValue: string) => props.source.intialValues[locationValue],
  );
  if (!fileLocation) throw Error("No video location was found in intialValues");

  if (props.source?.intialValues?.transcode_file_location)
    mimetype.value = "video/mp4";

  return `/api/mediafile/${getMediafilePath(
    props.source?.intialValues?.transcode_file_location ||
      props.source?.intialValues?.original_file_location,
  )}`;
};
</script>
