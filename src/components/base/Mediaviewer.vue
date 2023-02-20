<template>
  <entity-image-selection
    v-model:selectedImage="mediafileSelectionState.selectedMediafile"
    :class="['w-40', editMode === 'edit' ? 'shadow-md' : '']"
    :loading="loading"
  />
  <div
    v-show="!loading && mediafileSelectionState.selectedMediafile"
    :class="[
      'justify-center ',
      { checkboard: loading },
      entityType === 'MediaFile' ? 'w-full h-screen' : 'flex w-4/6',
    ]"
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
        canGet(result?.Entity?.permission)
          ? mediafileSelectionState.selectedMediafile.original_file_location
          : ''
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
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import IIIFViewer from "../IIIFViewer.vue";
import VideoPlayer from "./VideoPlayer.vue";
import AudioPlayer from "./AudioPlayer.vue";
import PDFViewer from "./PDFViewer.vue";
import TextViewer from "./TextViewer.vue";
import EntityImageSelection, {
  useEntityMediafileSelector,
} from "../EntityImageSelection.vue";
import { usePermissions } from "../../composables/usePermissions";

export default defineComponent({
  name: "MediaViewer",
  components: {
    IIIFViewer,
    VideoPlayer,
    AudioPlayer,
    PDFViewer,
    TextViewer,
    EntityImageSelection,
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
    };
  },
});
</script>
