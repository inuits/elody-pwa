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
      v-if="!loading && selectedImage"
      class="flex flex-col items-end mt-2 overflow-y-scroll"
    >
      <div
        v-for="(mediaFile, arrayKey) in mediafiles"
        :key="mediaFile.filename ? mediaFile.filename : 'no-filename'"
        :class="[' px-5 py-2 flex flex-col justify-end']"
      >
        <img
          v-if="
            mediaFile.thumbnail_file_location &&
            mediaFile.filename &&
            mediaFile.filename !== selectedImage
          "
          :class="[
            'obtain-cover rounded-sm outline-none shadow-sm rounded cursor-pointer w-full',
          ]"
          :src="mediaFile.thumbnail_file_location"
          @click="selectImage(mediaFile.filename)"
        />
        <img
          v-if="
            mediaFile.thumbnail_file_location &&
            mediaFile.filename &&
            mediaFile.filename === selectedImage
          "
          :class="[
            'obtain-cover rounded-sm outline-none shadow-sm rounded cursor-pointer w-full border-2 border-blue-500',
          ]"
          :src="mediaFile.thumbnail_file_location"
          @click="selectImage(mediaFile.filename)"
        />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
  import { defineComponent, PropType, ref, watch } from 'vue';
  import { Maybe, MediaFile, MinimalEntityFragment } from '@/queries';

  export default defineComponent({
    name: 'EntityImageSelection',
    props: {
      mediafiles: { type: Array as PropType<MediaFile[]>, required: true },
      selectedImage: {
        type: String,
        required: true,
      },
      loading: {
        type: Boolean,
        default: false,
      },
    },
    emits: ['update:selectedImage'],
    setup(props, { emit }) {
      const selectImage = (url: Maybe<string> | undefined) => {
        url && emit('update:selectedImage', url);
      };

      return {
        selectImage,
      };
    },
  });
</script>
