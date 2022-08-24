<template>
  <div
    v-if="!loading"
    class="h-full w-full flex fixed top-0 bg-neutral-0 pt-24 pl-20 left-0"
  >
    <entity-image-selection
      v-show="loading || mediafiles.length > 0"
      class="w-40"
      :loading="loading"
      :mediafiles="mediafiles"
      v-model:selectedImage="mediafileSelectionState.selectedMediafile"
    />
    <div
      v-show="!loading && mediafiles.length > 0"
      :class="['flex w-4/6 justify-center ', { checkboard: loading }]"
    >
      <IIIFViewer
        v-if="
          !loading &&
          mediafileSelectionState.selectedMediafile !== undefined &&
          mediafileSelectionState.selectedMediafile.mimetype.includes('image')
        "
        :image-url="mediafileSelectionState.selectedMediafile.filename"
        :image-meta-data="mediafileSelectionState.selectedMediafile.metadata"
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
    <!-- meta is metadata form-->
    <Meta
      :class="!loading && mediafiles.length > 0 ? 'w-2/6' : 'w-full'"
      :loading="loading"
      :entity-id="result ? result.Entity.id : undefined"
      :metadata="result ? result.Entity.metadata : []"
      :entity-title="title"
      :form="result?.Entity?.form"
    />
  </div>
</template>

<script lang="ts">
  import { computed, defineComponent, watch, ref, reactive, onMounted } from 'vue';
  import { useMutation, useQuery } from '@vue/apollo-composable';
  import IIIFViewer from '@/components/IIIFViewer.vue';
  import Meta from '@/components/Meta.vue';
  import {
    GetEntityByIdDocument,
    GetEntityByIdQuery,
    Maybe,
    MediaFile,
    GetEntityByIdQueryVariables,
    PostMediaFileMutation,
    PostMediaFileDocument,
  } from '@/queries';
  import { usePageTitle } from '@/components/TheHeader.vue';
  import { useEditMode } from '@/components/EditToggle.vue';
  import EntityImageSelection, {
    useEntityMediafileSelector,
  } from '@/components/EntityImageSelection.vue';
  import { useRoute, onBeforeRouteUpdate } from 'vue-router';
  import { asString } from '@/helpers';
  import VideoPlayer from '@/components/base/VideoPlayer.vue';
  import AudioPlayer from '@/components/base/AudioPlayer.vue';
  import PDFViewer from '@/components/base/PDFViewer.vue';
import useDropzoneHelper from '@/composables/useDropzoneHelper';

  export default defineComponent({
    name: 'SingleEntity',
    components: {
      IIIFViewer,
      EntityImageSelection,
      Meta,
      VideoPlayer,
      AudioPlayer,
      PDFViewer,
    },
    setup() {
      const { myDropzone, isUploading, selectedFiles, increaseSuccessCounter } = useDropzoneHelper();
      const id = asString(useRoute().params['id']);
      const loading = ref<boolean>(true);
      const { mediafileSelectionState } = useEntityMediafileSelector();

      const mediafiles = ref<MediaFile[]>([]);
      const { editMode, showEditToggle, hideEditToggle } = useEditMode();
      const { updatePageTitle } = usePageTitle();

      const queryVariables = reactive<GetEntityByIdQueryVariables>({
        id: id,
      });

      const { result, refetch, onResult } = useQuery<GetEntityByIdQuery>(
        GetEntityByIdDocument,
        queryVariables,
        {
          notifyOnNetworkStatusChange: true,
          fetchPolicy: 'no-cache',
        },
      );
      const title = computed(() => {
        if (result.value && result.value.Entity?.title[0]?.__typename === 'Metadata') {
          const tileMetada = result.value.Entity?.title[0];
          return tileMetada.value;
        }
        return undefined;
      });

      const { mutate, onDone } = useMutation<PostMediaFileMutation>(PostMediaFileDocument);

      watch(title, (value: Maybe<string> | undefined) => {
        value && updatePageTitle(value, 'entityTitle');
      });

      const md = [
          {"key": "rights", "value": "CC0 1.0"},
          {"key": "source", "value": "Archief Gent"},
          {"key": "publication_status", "value": "niet-publiek"},
      ];

      watch(() => isUploading.value, () => {
        if (isUploading.value) {
          selectedFiles.value.forEach((file: any) => {
            mutate({
              mediaFileInput: { filename: file.upload.filename, metadata: md},
              file: file,
            });
          });
          myDropzone.value.removeAllFiles();
          isUploading.value = false;
        }
      });

      onDone((value) => {
        if (value.data && value.data.postMediaFile) {
          mediafiles.value.push(value.data.postMediaFile);
        }        
        increaseSuccessCounter();
      });

      onBeforeRouteUpdate(async (to, from) => {
        //@ts-ignore
        queryVariables.id = to.params.id;
      });

      onResult((queryResult) => {
        if (
          queryResult.data &&
          queryResult.data.Entity?.media?.mediafiles &&
          queryResult.data.Entity?.media?.mediafiles?.length > 0
        ) {
          mediafiles.value = [];
          queryResult.data.Entity.media.mediafiles?.forEach((mediafile, index) => {
            if (mediafile?.__typename === 'MediaFile') {
              if (mediafile._id == mediafileSelectionState.value.selectedMediafile?._id) {
                mediafileSelectionState.value.selectedMediafile = mediafile;
              } else if (
                !mediafileSelectionState.value.selectedMediafile &&
                index === 0
              ) {
                mediafileSelectionState.value.selectedMediafile = mediafile;
              }
              mediafiles.value.push(mediafile);
            }
          });
        }
        //If form show edit togle
        if (queryResult.data && queryResult.data.Entity?.form) {
          showEditToggle();
        } else if (queryResult.data && queryResult.data?.Entity) {
          showEditToggle();
        }

        loading.value = false;
      });

      document.addEventListener('save', () => {
        refetch();
      });

      return {
        result,
        loading,
        title,
        mediafiles,
        editMode,
        mediafileSelectionState,
      };
    },
  });
</script>
