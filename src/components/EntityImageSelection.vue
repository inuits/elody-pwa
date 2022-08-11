<template>
  <div
    :class="[
      'flex flex-col items-center p-2',
      {
        'animate-pulse bg-neutral-20 text-neutral-20': loading,
      },
    ]"
  >
    <div v-if="!loading && selectedImage" class="flex flex-col items-end mt-2">
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
            v-if="
              mediaFile.thumbnail_file_location &&
              mediaFile.filename &&
              mediaFile.filename !== selectedImage.filename &&
              !mediaFile.mimetype.includes('audio')
            "
            :class="[
              'obtain-cover rounded-sm outline-none shadow-sm rounded cursor-pointer w-full',
              toBeDeleted.includes(mediaFile._id) ? 'filter blur-xs grayscale' : '',
            ]"
            :src="mediaFile.thumbnail_file_location"
            @click="selectImage(mediaFile)"
          />
          <img
            v-if="
              mediaFile.thumbnail_file_location &&
              mediaFile.filename &&
              mediaFile.filename === selectedImage.filename &&
              !mediaFile.mimetype.includes('audio')
            "
            :class="[
              'obtain-cover rounded-sm outline-none shadow-sm rounded cursor-pointer w-full border-2 border-blue-500',
              toBeDeleted.includes(mediaFile._id) ? 'filter blur-xs grayscale' : '',
            ]"
            :src="mediaFile.thumbnail_file_location"
            @click="selectImage(mediaFile)"
          />
          <AudioThumbnail
            v-if="
              mediaFile.filename !== selectedImage.filename &&
              mediaFile.thumbnail_file_location &&
              mediaFile?.mimetype.includes('audio')
            "
            :class="[
              'obtain-cover rounded-sm outline-none shadow-sm rounded cursor-pointer w-full border-2',
              toBeDeleted.includes(mediaFile._id) ? 'filter blur-xs grayscale' : '',
            ]"
            @click="selectImage(mediaFile)"
          />
          <AudioThumbnail
            v-if="
              mediaFile.filename === selectedImage.filename &&
              mediaFile?.mimetype.includes('audio')
            "
            :class="[
              'obtain-cover rounded-sm outline-none shadow-sm rounded cursor-pointer w-full border-2 border-blue-500',
              toBeDeleted.includes(mediaFile._id) ? 'filter blur-xs grayscale' : '',
            ]"
            @click="selectImage(mediaFile)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent, onMounted, PropType, ref, watch } from 'vue';
  import { useMutation, useQuery } from '@vue/apollo-composable';
  import {
    MediaFile,
    DeleteDataDocument,
    DeleteDataMutation,
    DeletePaths,
  } from '@/queries';
  import AudioThumbnail from '../components/base/audiothumbnail.vue';
  import TrashIcon from '../components/base/TrashIcon.vue';
  import { useEditMode } from '@/components/EditToggle.vue';

  export const toBeDeleted = ref<string[]>([]);

  type MediafileSelectionState = {
    selectedMediafile: MediaFile | undefined;
  };

  const mediafileSelectionState = ref<MediafileSelectionState>({
    selectedMediafile: undefined,
  });

  export const useEntityMediafileSelector = () => {
    const updateSelectedEntityMediafile = (mediafile: MediaFile) => {
      mediafileSelectionState.value.selectedMediafile = mediafile;
    };

    return { mediafileSelectionState, updateSelectedEntityMediafile };
  };

  export default defineComponent({
    name: 'EntityImageSelection',
    components: {
      AudioThumbnail,
      TrashIcon,
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
    setup(props) {
      const { updateSelectedEntityMediafile } = useEntityMediafileSelector();
      const selectImage = (mediafile: MediaFile) => {
        updateSelectedEntityMediafile(mediafile);
      };

      const { editMode, addSaveCallback } = useEditMode();

      const { mutate } = useMutation<DeleteDataMutation>(DeleteDataDocument);

      const addToSaveCallback = (id: string, arrayKey: string) => {
        const parsedId = id.replace('mediafiles/', '');
        toBeDeleted.value.push(id);
        addSaveCallback(async () => {
          await mutate({ id: parsedId, path: DeletePaths.Mediafiles });
        });
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
      };
    },
  });
</script>
