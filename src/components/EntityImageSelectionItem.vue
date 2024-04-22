<template>
  <div
    class="py-2 flex flex-col justify-end flex items-center"
    :key="
      getValueOfMediafile('filename', mediafile)
        ? getValueOfMediafile('filename', mediafile)
        : 'no-filename'
    "
  >
    <div v-if="canShowCopyRight() && !imageSrcError" class="relative group">
      <ImageViewer
        :class="[
          'obtain-cover outline-none shadow-sm rounded cursor-pointer w-full',
          toBeDeleted.includes(mediafile.id) ? 'filter blur-xs grayscale' : '',
          mediafileSelectionState.selectedMediafile &&
          getValueOfMediafile('filename', mediafile) ===
            getValueOfMediafile('filename')
            ? 'p-6 border-2 border-accent-normal'
            : '',
        ]"
        :url="
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
        @error="setNoImage()"
      />
    </div>
    <div v-else class="relative group">
      <unicon
        :name="getThumbnail(mediafile)"
        class="h-20 w-20 text-neutral-700 rounded-sm outline-none shadow-sm self-center"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { MediaFileEntity } from "@/generated-types/queries";
import { toBeDeleted } from "@/composables/useEdit";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import { useAuth } from "session-vue-3-oidc-library";
import { ref } from "vue";
import useThumbnailHelper from "@/composables/useThumbnailHelper";
import ImageViewer from "@/components/base/ImageViewer.vue";

const props = defineProps<{
  mediafile: MediaFileEntity;
}>();

const auth = useAuth();
const { getThumbnail } = useThumbnailHelper();
const imageSrcError = ref<boolean>(false);

const setNoImage = () => {
  imageSrcError.value = true;
};

const canShowCopyRight = () => {
  if (auth.isAuthenticated.value === true) return true;
  return props.mediafile.intialValues.copyrightColor !== "red";
};

const {
  mediafileSelectionState,
  getValueOfMediafile,
  updateSelectedEntityMediafile,
} = useEntityMediafileSelector();
</script>
