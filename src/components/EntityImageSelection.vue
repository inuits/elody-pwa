<template>
  <div
    :class="[
      'flex flex-col items-center p-2',
      {
        'animate-pulse bg-neutral-20 text-neutral-20': loading,
      },
    ]"
  >
    <div
      v-if="!loading && mediafiles.length > 0"
      class="flex flex-col items-end mt-2 overflow-y-auto"
    >
      <div
        v-for="(mediaFile, arrayKey) in mediafiles"
        :key="mediaFile.filename ? mediaFile.filename : 'no-filename'"
        :class="[' px-5 py-2 flex flex-col justify-end']"
      >
        <div class="relative group">
          <trash-icon
            v-if="editMode === 'edit' && !toBeDeleted.includes(mediaFile._id)"
            class="hidden group-hover:block"
            @click="addToSaveCallback(mediaFile._id, arrayKey)"
          />
          <img
            v-if="mediaFile.thumbnail_file_location && !mediaFile.mimetype.includes('audio') && !mediaFile.mimetype.includes('text/plain')"
            :class="[
              'obtain-cover outline-none shadow-sm rounded cursor-pointer w-full',
              toBeDeleted.includes(mediaFile._id) ? 'filter blur-xs grayscale' : '',
              selectedImage && (mediaFile.filename === selectedImage.filename) ? 'border-2 border-blue-500' : ''
            ]"
            :src="`/api/iiif/3/${mediaFile.filename}/square/100,/0/default.jpg`"
            @click="selectImage(mediaFile)"
          />
          <AudioThumbnail
            v-if="mediaFile.thumbnail_file_location && mediaFile?.mimetype.includes('audio')"
            :class="[
              'obtain-cover outline-none shadow-sm rounded cursor-pointer w-full border-2',
              toBeDeleted.includes(mediaFile._id) ? 'filter blur-xs grayscale' : '',
              selectedImage && (mediaFile.filename === selectedImage.filename) ? 'border-2 border-blue-500' : ''
            ]"
            @click="selectImage(mediaFile)"
          />
          <SvgThumbnail 
             v-if="mediaFile.thumbnail_file_location && mediaFile?.mimetype.includes('text/plain')"
             :class="[
              'obtain-cover outline-none shadow-sm rounded cursor-pointer w-full border-2',
              toBeDeleted.includes(mediaFile._id) ? 'filter blur-xs grayscale' : '',
              selectedImage && (mediaFile.filename === selectedImage.filename) ? 'border-2 border-blue-500' : ''
            ]"
            @click="selectImage(mediaFile)"
          />
        </div>
      </div>
    </div>
    <div :class="editMode === 'edit' ? 'pb-20 pt-5' : ''">
      <plus-circle-icon
        v-if="editMode === 'edit'"
        @click="openUploadModal(modalChoices.DROPZONE)"
      />
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent, onMounted, PropType, ref, watch, reactive } from 'vue';
  import { useMutation } from '@vue/apollo-composable';
  import {
    MediaFile,
    DeleteDataDocument,
    DeleteDataMutation,
    DeletePaths,
  } from '@/queries';
  import AudioThumbnail from '../components/base/audiothumbnail.vue';
  import SvgThumbnail from './base/svgThumbnail.vue';
  import TrashIcon from '../components/base/TrashIcon.vue';
  import PlusCircleIcon from '../components/base/PlusCircleIcon.vue';
  import { useEditMode } from '@/components/EditToggle.vue';
  import { useUploadModal } from './UploadModal.vue';
  import useDropzoneHelper from '../composables/useDropzoneHelper';
  import useMediaAssetLinkHelper from '../composables/useMediaAssetLinkHelper';
  import useMetaDataHelper from '../composables/useMetaDataHelper';
  export const toBeDeleted = ref<string[]>([]);

  type MediafileSelectionState = {
    selectedMediafile: MediaFile | undefined;
  };

  const mediafileSelectionState = reactive<MediafileSelectionState>({
    selectedMediafile: undefined,
  });

  export const useEntityMediafileSelector = () => {
    const updateSelectedEntityMediafile = (mediafile: MediaFile | undefined) => {
      mediafileSelectionState.selectedMediafile = mediafile;
    };

    return { mediafileSelectionState, updateSelectedEntityMediafile };
  };

  export default defineComponent({
    name: 'EntityImageSelection',
    components: {
      AudioThumbnail,
      PlusCircleIcon,
      TrashIcon,
      SvgThumbnail
    },
    props: {
      mediafiles: { type: Array as PropType<MediaFile[]>, required: true },
      selectedImage: {
        type: Object as PropType<MediaFile | null>,
        required: true,
      },
      loading: {
        type: Boolean,
        default: false,
      },
    },
    setup(props, { emit }) {
      const { selectedFiles } = useDropzoneHelper();
      const { updateSelectedEntityMediafile } = useEntityMediafileSelector();
      const { isMediaFileInLinkList, removeMediaFileFromLinkList } =
        useMediaAssetLinkHelper();
      const { removeFromMetaDataPatchList } = useMetaDataHelper();
      const { openUploadModal, uploadModalState, modalChoices } = useUploadModal();
      const selectImage = (mediafile: MediaFile) => {
        updateSelectedEntityMediafile(mediafile);
      };

      const { editMode, addSaveCallback } = useEditMode();

      const { mutate } = useMutation<DeleteDataMutation>(DeleteDataDocument);

      const addToSaveCallback = (id: string, arrayKey: string) => {
        const parsedId = id.replace('mediafiles/', '');
        removeFromMetaDataPatchList(parsedId);
        toBeDeleted.value.push(id);
        if (!isMediaFileInLinkList(id)) {
          addSaveCallback(async () => {
            await mutate({ id: parsedId, path: DeletePaths.Mediafiles });
          });
        } else {
          removeMediaFileFromLinkList(id);
        }
      };

      onMounted(() => {
        if (props.selectedImage) {
          updateSelectedEntityMediafile(props.selectedImage);
        }
      });

      return {
        selectImage,
        editMode,
        addToSaveCallback,
        toBeDeleted,
        openUploadModal,
        modalChoices,
        selectedFiles,
      };
    },
  });
</script>
