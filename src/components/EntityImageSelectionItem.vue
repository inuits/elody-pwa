<template>
  <div
    :key="element.filename ? element.filename : 'no-filename'"
    :class="['px-5 py-2 flex flex-col justify-end']"
  >
    <div class="relative group">
      <trash-icon
        v-if="editMode === 'edit' && !toBeDeleted.includes(element._id)"
        class="hidden group-hover:block"
        @click="addToSaveCallback(element._id)"
      />
      <AudioThumbnail
        v-if="
          element.thumbnail_file_location &&
          element?.mimetype &&
          element?.mimetype.includes('audio')
        "
        :class="[
          'obtain-cover outline-none shadow-sm rounded cursor-pointer w-full border-2',
          toBeDeleted.includes(element._id) ? 'filter blur-xs grayscale' : '',
          selectedImage && element.filename === selectedImage.filename
            ? selectedThumbnailStyles
            : '',
        ]"
        @click="selectImage(element)"
      />
      <SvgThumbnail
        v-else-if="
          element.thumbnail_file_location &&
          element?.mimetype &&
          element?.mimetype.includes('text/plain')
        "
        :class="[
          'obtain-cover outline-none shadow-sm rounded cursor-pointer w-full border-2',
          toBeDeleted.includes(element._id) ? 'filter blur-xs grayscale' : '',
          selectedImage && element.filename === selectedImage.filename
            ? selectedThumbnailStyles
            : '',
        ]"
        @click="selectImage(element)"
      />
      <img
        v-else-if="element.thumbnail_file_location"
        :class="[
          'obtain-cover outline-none shadow-sm rounded cursor-pointer w-full',
          toBeDeleted.includes(element._id) ? 'filter blur-xs grayscale' : '',
          selectedImage && element.filename === selectedImage.filename
            ? selectedThumbnailStyles
            : '',
        ]"
        :src="
          element?.mimetype && !element.mimetype.includes('pdf')
            ? `/api/iiif/3/${
                element.transcode_filename || element.filename
              }/square/100,/0/default.jpg`
            : element.thumbnail_file_location
        "
        @click="selectImage(element)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, type PropType } from "vue";
import useEditMode from "@/composables/useEdit";
import useMediaAssetLinkHelper from "@/composables/useMediaAssetLinkHelper";
import useMetaDataHelper from "@/composables/useMetaDataHelper";
import {
  Collection,
  DeleteDataDocument,
  type DeleteDataMutation,
  type MediaFile,
} from "@/generated-types/queries";
import { useMutation } from "@vue/apollo-composable";
import { useEntityMediafileSelector } from "./EntityImageSelection.vue";
import { toBeDeleted } from "./EntityImageSelection.vue";

export default defineComponent({
  name: "EntityImageSelectionItem",
  components: {},
  props: {
    element: { type: Object as PropType<MediaFile>, required: true },
    selectedImage: {
      type: Object as PropType<MediaFile | null>,
      required: true,
    },
  },
  setup(props) {
    const { updateSelectedEntityMediafile } = useEntityMediafileSelector();
    const selectImage = (mediafile: MediaFile) => {
      updateSelectedEntityMediafile(mediafile);
    };
    const { addSaveCallback } = useEditMode();
    const { isMediaFileInLinkList, removeMediaFileFromLinkList } =
      useMediaAssetLinkHelper();
    const { editMode } = useEditMode();
    const selectedThumbnailStyles = "p-6 border-2 border-accent-normal";
    const { removeFromMetaDataPatchList } = useMetaDataHelper();
    const { mutate } = useMutation<DeleteDataMutation>(DeleteDataDocument);

    const addToSaveCallback = (id: string) => {
      const parsedId = id.replace("mediafiles/", "");
      removeFromMetaDataPatchList(parsedId);
      toBeDeleted.value.push(id);
      if (!isMediaFileInLinkList(id)) {
        addSaveCallback(async () => {
          await mutate({ id: parsedId, path: Collection.Mediafiles });
        });
      } else {
        removeMediaFileFromLinkList(id);
      }
    };

    return {
      selectImage,
      addToSaveCallback,
      editMode,
      selectedThumbnailStyles,
      toBeDeleted,
    };
  },
});
</script>
