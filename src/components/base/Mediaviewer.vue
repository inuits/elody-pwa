<template>
  <div class="flex h-full checkboard ml-1">
    <div class="w-1/3 m-5">
      <entity-image-selection
        v-model:selectedImage="mediafileSelectionState.selectedMediafile"
        :loading="loading"
      />
    </div>
    <div
      v-show="!loading && mediafileSelectionState.selectedMediafile"
      class="w-full"
    >
      <IIIFViewer
        v-if="
          !loading &&
          mediafileSelectionState.selectedMediafile !== undefined &&
          mediafileSelectionState.selectedMediafile.mimetype?.includes('image')
        "
        :is-public="mediafileSelectionState.selectedMediafile.isPublic"
        :imageFilename="
          mediafileSelectionState.selectedMediafile.transcode_filename ||
          mediafileSelectionState.selectedMediafile.filename ||
          ''
        "
        :downloadLocation="
          mediafileSelectionState.selectedMediafile.original_file_location
        "
      />
      <VideoPlayer
        v-if="
          !loading &&
          mediafileSelectionState.selectedMediafile !== undefined &&
          mediafileSelectionState.selectedMediafile.mimetype?.includes('video')
        "
        :source="mediafileSelectionState.selectedMediafile"
      />
      <AudioPlayer
        v-if="
          !loading &&
          mediafileSelectionState.selectedMediafile !== undefined &&
          mediafileSelectionState.selectedMediafile.mimetype?.includes('audio')
        "
        :source="mediafileSelectionState.selectedMediafile"
      />
      <PDFViewer
        v-if="
          !loading &&
          mediafileSelectionState.selectedMediafile !== undefined &&
          mediafileSelectionState.selectedMediafile.mimetype?.includes('pdf')
        "
        :source="mediafileSelectionState.selectedMediafile"
      />
      <TextViewer
        v-if="
          !loading &&
          mediafileSelectionState.selectedMediafile !== undefined &&
          mediafileSelectionState.selectedMediafile.mimetype?.includes(
            'text/plain'
          )
        "
        :source="mediafileSelectionState.selectedMediafile"
      />
      <MiradorViewer
        v-if="
          !loading &&
          mediafileSelectionState.selectedMediafile !== undefined &&
          mediafileSelectionState.selectedMediafile.original_file_location &&
          mediafileSelectionState.selectedMediafile.mimetype?.includes(
            'json/manifest'
          )
        "
        :manifest-url="
          mediafileSelectionState.selectedMediafile?.original_file_location
        "
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import IIIFViewer from "../IIIFViewer.vue";
import VideoPlayer from "./VideoPlayer.vue";
import AudioPlayer from "./AudioPlayer.vue";
import PDFViewer from "./PDFViewer.vue";
import TextViewer from "./TextViewer.vue";
import MiradorViewer from "../ManifestViewer.vue";
import EntityImageSelection, {
  useEntityMediafileSelector,
} from "../EntityImageSelection.vue";
import { usePermissions } from "../../composables/usePermissions";
import { Unicons } from "@/types";

export default defineComponent({
  name: "MediaViewer",
  components: {
    IIIFViewer,
    VideoPlayer,
    AudioPlayer,
    PDFViewer,
    TextViewer,
    EntityImageSelection,
    MiradorViewer,
  },
  props: {
    loading: Boolean,
    entityType: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { mediafileSelectionState } = useEntityMediafileSelector();
    const { canGet } = usePermissions();

    return {
      canGet,
      mediafileSelectionState,
      Unicons,
    };
  },
});
</script>
