<template>
  <div
    class="px-5 py-2 flex flex-col justify-end"
    :key="
      getValueOfMediafile('filename', mediafile)
        ? getValueOfMediafile('filename', mediafile)
        : 'no-filename'
    "
  >
    <div class="relative group">
      <img
        :class="[
          'obtain-cover outline-none shadow-sm rounded cursor-pointer w-full',
          toBeDeleted.includes(mediafile.id) ? 'filter blur-xs grayscale' : '',
          mediafileSelectionState.selectedMediafile &&
          getValueOfMediafile('filename', mediafile) ===
            getValueOfMediafile('filename')
            ? 'p-6 border-2 border-accent-normal'
            : '',
        ]"
        :src="
          getValueOfMediafile('mimetype', mediafile) &&
          !getValueOfMediafile('mimetype', mediafile).includes('pdf') &&
          !getValueOfMediafile('mimetype', mediafile).includes('json/manifest')
            ? `/api/iiif/3/${
                getValueOfMediafile('transcode_filename', mediafile) ||
                getValueOfMediafile('filename', mediafile)
              }/square/100,/0/default.jpg`
            : getValueOfMediafile('thumbnail_file_location', mediafile)
        "
        @click="updateSelectedEntityMediafile(mediafile)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { MediaFileEntity } from "@/generated-types/queries";
import { toBeDeleted } from "@/composables/useEdit";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";

defineProps<{
  mediafile: MediaFileEntity;
}>();

const {
  mediafileSelectionState,
  getValueOfMediafile,
  updateSelectedEntityMediafile,
} = useEntityMediafileSelector();
</script>
