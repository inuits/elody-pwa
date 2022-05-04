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
          <trash-icon class="hidden group-hover:block" />
          <img
            v-if="
              mediaFile.thumbnail_file_location &&
              mediaFile.filename &&
              mediaFile.filename !== selectedImage.filename &&
              !mediaFile?.filename.includes('.mp3')
            "
            :class="[
              'obtain-cover rounded-sm outline-none shadow-sm rounded cursor-pointer w-full',
            ]"
            :src="mediaFile.thumbnail_file_location"
            @click="selectImage(mediaFile)"
          />
          <img
            v-if="
              mediaFile.thumbnail_file_location &&
              mediaFile.filename &&
              mediaFile.filename === selectedImage.filename &&
              !mediaFile?.filename.includes('.mp3')
            "
            :class="[
              'obtain-cover rounded-sm outline-none shadow-sm rounded cursor-pointer w-full border-2 border-blue-500',
            ]"
            :src="mediaFile.thumbnail_file_location"
            @click="selectImage(mediaFile)"
          />
        </div>
        <div class="relative group">
          <trash-icon class="hidden group-hover:block" />

          <AudioThumbnail
            v-if="
              mediaFile.filename !== selectedImage.filename &&
              mediaFile.thumbnail_file_location &&
              mediaFile?.filename.includes('.mp3')
            "
            :class="[
              'obtain-cover rounded-sm outline-none shadow-sm rounded cursor-pointer w-full border-2',
            ]"
            @click="selectImage(mediaFile)"
          />
          <AudioThumbnail
            v-if="
              mediaFile.filename === selectedImage.filename &&
              mediaFile?.filename.includes('.mp3')
            "
            :class="[
              'obtain-cover rounded-sm outline-none shadow-sm rounded cursor-pointer w-full border-2 border-blue-500',
            ]"
            @click="selectImage(mediaFile)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent, PropType, ref, watch } from 'vue';
  import { useMutation, useQuery } from '@vue/apollo-composable';
  import {
    MediaFile,
    DeleteDataDocument,
    DeleteDataMutation,
    DeletePaths,
  } from '@/queries';
  import AudioThumbnail from '../components/base/audiothumbnail.vue';
  import TrashIcon from '../components/base/TrashIcon.vue';
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
    emits: ['update:selectedImage'],
    setup(props, { emit }) {
      const selectImage = (mediafile: MediaFile) => {
        mediafile && emit('update:selectedImage', mediafile);
      };

      const { mutate } = useMutation<DeleteDataMutation>(DeleteDataDocument);

      const deleteMedia = (id: string) => {
        const parsedId = id.replace('mediafiles/', '');
        mutate({ id: parsedId, path: DeletePaths.Mediafiles });
      };

      return {
        selectImage,
        deleteMedia,
      };
    },
  });
</script>
