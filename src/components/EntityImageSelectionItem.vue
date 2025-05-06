<template>
  <div
    class="py-2 flex flex-col justify-end flex items-center"
    :key="
      getValueOfMediafile(mediafileViewerContext, 'filename', mediafile)
        ? getValueOfMediafile(mediafileViewerContext, 'filename', mediafile)
        : 'no-filename'
    "
  >
    <div v-if="canShowCopyRight && !imageSrcError" class="relative group">
      <ImageViewer
        :class="[
          'obtain-cover outline-none shadow-sm rounded cursor-pointer w-full',
          toBeDeleted.includes(mediafile.id) ? 'filter blur-xs grayscale' : '',
          mediafileSelectionState[mediafileViewerContext].selectedMediafile &&
          getValueOfMediafile(mediafileViewerContext, 'filename', mediafile) ===
            getValueOfMediafile(mediafileViewerContext, 'filename')
            ? 'p-6 border-2 border-accent-normal'
            : '',
        ]"
        :url="
          getValueOfMediafile(mediafileViewerContext, 'mimetype', mediafile) &&
          !getValueOfMediafile(
            mediafileViewerContext,
            'mimetype',
            mediafile,
          ).includes('json/manifest')
            ? `/api/iiif/3/${
                getValueOfMediafile(
                  mediafileViewerContext,
                  'transcode_filename',
                  mediafile,
                ) ||
                getValueOfMediafile(
                  mediafileViewerContext,
                  'filename',
                  mediafile,
                )
              }/square/100,/0/default.jpg`
            : getValueOfMediafile(
                mediafileViewerContext,
                'thumbnail_file_location',
                mediafile,
              )
        "
        @click="
          updateSelectedEntityMediafile(mediafileViewerContext, mediafile)
        "
        @error="setNoImage()"
      />
    </div>
    <div v-else class="relative group">
      <unicon
        :name="getThumbnail(mediafile)"
        @click="
          updateSelectedEntityMediafile(mediafileViewerContext, mediafile)
        "
        :class="[
          'h-20 w-20 text-neutral-700 rounded-sm outline-none shadow-sm self-center',
          mediafileSelectionState[mediafileViewerContext].selectedMediafile &&
          getValueOfMediafile(mediafileViewerContext, 'filename', mediafile) ===
            getValueOfMediafile(mediafileViewerContext, 'filename')
            ? 'p-6 border-2 border-accent-normal'
            : '',
        ]"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { type MediaFileEntity } from "@/generated-types/queries";
import { useEditMode } from "@/composables/useEdit";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import { auth } from "@/main";
import { inject, ref, computed } from "vue";
import useThumbnailHelper from "@/composables/useThumbnailHelper";
import ImageViewer from "@/components/base/ImageViewer.vue";

const props = defineProps<{
  mediafile: MediaFileEntity;
}>();

const { getThumbnail } = useThumbnailHelper();
const imageSrcError = ref<boolean>(false);

const mediafileViewerContext: any = inject("mediafileViewerContext");
const entityFormData: any = inject("entityFormData");

const toBeDeleted = computed(() => useEditMode(entityFormData.id).toBeDeleted);

const setNoImage = () => {
  imageSrcError.value = true;
};

const canShowCopyRight = computed(() => {
  if (auth.isAuthenticated.value === true) return true;
  return props.mediafile.intialValues.copyrightColor !== "red";
});

const {
  mediafileSelectionState,
  getValueOfMediafile,
  updateSelectedEntityMediafile,
} = useEntityMediafileSelector();
</script>
