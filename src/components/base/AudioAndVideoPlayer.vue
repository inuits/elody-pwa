<template>
  <div class="w-full h-full relative flex flex-col">
    <div class="relative shrink-0 h-(--viewer-toolbar-height)">
      <ViewerToolbar
        mode="av"
        :mediafile-id="props.source?.id"
        :original-filename="props.source?.intialValues?.original_filename"
      />
    </div>
    <div class="flex-1 min-h-0" v-if="mediaType === 'Video'">
      <video
        class="w-full h-full bg-white"
        preload="auto"
        controls
        controlsList="nodownload"
      >
        <source :src="getFileUrl()" :type="mimetype" />
        Video not supported
      </video>
    </div>
    <div class="grid grid-rows-2 flex-1 min-h-0" v-else>
      <div class="flex justify-center items-end w-full bg-white">
        <unicon class="h-24 w-24 text-neutral-70" :name="Unicons.Music.name" />
      </div>
      <audio class="w-full bg-white" controls controlsList="nodownload">
        <source :src="getFileUrl()" :type="mimetype" />
        {{ $t("audio.no-support") }}
      </audio>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import { Unicons } from "@/types";
import { ref, inject } from "vue";
import ViewerToolbar from "@/components/ViewerToolbar.vue";

type AudioAndVideoPlayerMediaType = "Audio" | "Video";

const props = defineProps<{
  source?: any;
  mediaType: AudioAndVideoPlayerMediaType;
}>();

const { getValueOfMediafile } = useEntityMediafileSelector();

const mediafileViewerContext: any = inject("mediafileViewerContext", "");

const mimetype = ref<string>(
  getValueOfMediafile(mediafileViewerContext, "mimetype") || "no-type",
);

const getFileUrl = (): string => {
  const fileLocation: string | undefined = props.source.id;

  if (!fileLocation)
    throw Error(`No ${props.mediaType} id was found in mediafile`);

  if (props.mediaType === "Video") {
    mimetype.value = "video/mp4";
  } else {
    mimetype.value = "audio/mp3";
  }

  return `/api/mediafile/${fileLocation}`;
};
</script>
