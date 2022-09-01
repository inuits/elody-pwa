<template>
  <div
    v-if="!loading && mediafileSelectionState.selectedMediafile"
    class="h-full w-full flex fixed top-0 bg-neutral-0 pt-24 pl-20 left-0"
  >
    <div
      v-show="!loading"
      :class="['flex w-full justify-center ', { checkboard: loading }]"
    >
      <IIIFViewer
        v-if="
          !loading &&
          mediafileSelectionState.selectedMediafile !== undefined &&
          mediafileSelectionState.selectedMediafile.mimetype.includes('image')
        "
        :is-public="mediafileSelectionState.selectedMediafile.isPublic"
        :image-url="mediafileSelectionState.selectedMediafile.filename"
        :image-transcode-url="
          mediafileSelectionState.selectedMediafile.transcode_filename
        "
      />
      <VideoPlayer
        v-if="
          !loading &&
          mediafileSelectionState.selectedMediafile !== undefined &&
          mediafileSelectionState.selectedMediafile.mimetype.includes('video')
        "
        :source="mediafileSelectionState.selectedMediafile"
      />
      <AudioPlayer
        v-if="
          !loading &&
          mediafileSelectionState.selectedMediafile !== undefined &&
          mediafileSelectionState.selectedMediafile.mimetype.includes('audio')
        "
        :source="mediafileSelectionState.selectedMediafile"
      />
      <PDFViewer
        v-if="
          !loading &&
          mediafileSelectionState.selectedMediafile !== undefined &&
          mediafileSelectionState.selectedMediafile.mimetype.includes('pdf')
        "
        :source="mediafileSelectionState.selectedMediafile"
      />
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, reactive } from 'vue';
  import { useQuery } from '@vue/apollo-composable';
  import IIIFViewer from '@/components/IIIFViewer.vue';
  import Meta from '@/components/Meta.vue';
  import {
    Maybe,
    MediaFile,
    GetMediaFileByIdQueryVariables,
    GetMediaFileByIdQuery,
    GetMediaFileByIdDocument,
  } from '@/queries';
  import { usePageTitle } from '@/components/TheHeader.vue';
  import { useEditMode } from '@/components/EditToggle.vue';
  import {
    useEntityMediafileSelector,
  } from '@/components/EntityImageSelection.vue';
  import { useRoute, onBeforeRouteUpdate } from 'vue-router';
  import { asString } from '@/helpers';
  import VideoPlayer from '@/components/base/VideoPlayer.vue';
  import AudioPlayer from '@/components/base/AudioPlayer.vue';
  import PDFViewer from '@/components/base/PDFViewer.vue';

  export default defineComponent({
    name: 'SingleMediaFile',
    components: {
      IIIFViewer,
      VideoPlayer,
      AudioPlayer,
      PDFViewer,
    },
    setup() {
      const id = asString(useRoute().params['id']);
      const loading = ref<boolean>(true);
      const { mediafileSelectionState, updateSelectedEntityMediafile  } = useEntityMediafileSelector();
      const { editMode, showEditToggle } = useEditMode();
      const { updatePageTitle } = usePageTitle();

      const queryVariables = reactive<GetMediaFileByIdQueryVariables>({
        id: id,
      });

      const { result, refetch, onResult } = useQuery<GetMediaFileByIdQuery>(
        GetMediaFileByIdDocument,
        queryVariables,
        {
          notifyOnNetworkStatusChange: true,
          fetchPolicy: 'no-cache',
        },
      );

      onBeforeRouteUpdate(async (to, from) => {
        //@ts-ignore
        queryVariables.id = to.params.id;
      });

      document.addEventListener('save', () => {
        refetch();
      });

      document.addEventListener('discard', () => {
        refetch();
      });

      onResult(() => {
        showEditToggle();
        loading.value = false;
        if (result?.value?.MediaFile) {
          mediafileSelectionState.selectedMediafile = result.value.MediaFile;
          updateSelectedEntityMediafile(result.value.MediaFile);
          if (result.value.MediaFile.filename) {
            updatePageTitle(result.value.MediaFile.filename, 'entityTitle');
          }
        }
      });

      return {
        result,
        loading,
        // title,
        editMode,
        mediafileSelectionState,
      };
    },
  });
</script>
