<template>
  <div
    v-if="!loading"
    class="h-full w-full flex fixed top-0 bg-neutral-0 pt-24 pl-20 left-0"
  >
    <entity-image-selection
      v-show="(!loading) && isSelectionDisplayed"
      v-model:selectedImage="mediafileSelectionState.selectedMediafile"
      :class="['w-40', editMode === 'edit' ? 'shadow-md' : '']"
      :loading="loading"
      :mediafiles="mediafiles"
    />
    <div
      v-show="!loading"
      :class="['justify-center ', { checkboard: loading }, entityType === 'MediaFile' ? 'w-full' : 'flex w-4/6']"
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
    <!-- meta is metadata form-->
    <Meta
      v-if="isMetaDisplayed"
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
  import { computed, defineComponent, watch, ref, reactive } from 'vue';
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
  import useMediaAssetLinkHelper from '@/composables/useMediaAssetLinkHelper';
  import useMetaDataHelper from '@/composables/useMetaDataHelper';
import { useUploadModal } from '../UploadModal.vue';

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
    props: {
      isMetaDisplayed: Boolean,
      isSelectionDisplayed: Boolean,
      entityType: {
        type: String,
        required: true,
      }
    },
    setup(props) {
      const { myDropzone, isUploading, selectedFiles, increaseSuccessCounter, errorMessages } =
        useDropzoneHelper();
      const { addMediaFileToLinkList } = useMediaAssetLinkHelper();
      const { lastAdjustedMediaFileMetaData, mediafiles } = useMetaDataHelper();
      const id = asString(useRoute().params['id']);
      const loading = ref<boolean>(true);
      const { mediafileSelectionState, updateSelectedEntityMediafile } =
        useEntityMediafileSelector();

      const { editMode, showEditToggle } = useEditMode();
      const { updatePageTitle } = usePageTitle();
      const { closeUploadModal } = useUploadModal();

      const queryVariables = reactive<GetEntityByIdQueryVariables>({
        id: id,
        type: props.entityType
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

      const { mutate, onDone } =
        useMutation<PostMediaFileMutation>(PostMediaFileDocument);

      watch(title, (value: Maybe<string> | undefined) => {
        value && updatePageTitle(value, 'entityTitle');
      });

      watch(
        () => isUploading.value,
        async () => {
          if (isUploading.value) {
            for (const file of selectedFiles.value) {
              await mutate({
                mediaFileInput: { filename: file.upload.filename },
                file: file,
              }).catch(() => {
                return true;
              });
            }
            myDropzone.value.removeAllFiles();
            isUploading.value = false;
            if (errorMessages.value.length === 0) {
              closeUploadModal();
            }
          }
        },
      );

      const updateListWhenChanges = (newValue: any, oldValue: any) => {
        if (
          lastAdjustedMediaFileMetaData.value &&
          oldValue &&
          JSON.stringify(newValue) !== JSON.stringify(oldValue)
        ) {
          const index = mediafiles.value.findIndex(
            (x: MediaFile) =>
              x._id.replace('mediafiles/', '') ===
              lastAdjustedMediaFileMetaData.value.mediafileId,
          );
          if (mediafiles.value[index] && mediafiles.value[index].metadata) {
            mediafiles.value[index].metadata =
              lastAdjustedMediaFileMetaData.value.mediaFileInput;
          }
        }
      };

      watch(
        () => lastAdjustedMediaFileMetaData.value,
        (newValue: any, oldValue: any) => {
          updateListWhenChanges(newValue, oldValue);
        },
        { deep: true },
      );

      onDone((value) => {
        if (value.data && value.data.postMediaFile) {
          mediafiles.value.push(value.data.postMediaFile);
          addMediaFileToLinkList(value.data.postMediaFile);
        }
        increaseSuccessCounter();
      });

      onBeforeRouteUpdate(async (to: any, from: any) => {
        //@ts-ignore
        queryVariables.id = to.params.id;
      });

      onResult((queryResult: any) => {
        if (
          queryResult.data &&
          queryResult.data.Entity?.media?.mediafiles &&
          queryResult.data.Entity?.media?.mediafiles?.length > 0
        ) {
          mediafiles.value = [];
          let mediaFileChanged: boolean = false;
          queryResult.data.Entity.media.mediafiles?.forEach((mediafile: any, index: any) => {
            if (mediafile?.__typename === 'MediaFile') {
              if (mediafile._id == mediafileSelectionState.selectedMediafile?._id) {
                updateSelectedEntityMediafile(mediafile);
                mediaFileChanged = true;
              }
              mediafiles.value.push(mediafile);
            }
          });
          if (!mediaFileChanged && mediafiles.value[0])
            updateSelectedEntityMediafile(mediafiles.value[0]);
          if (!mediaFileChanged && !mediafiles.value[0])
            updateSelectedEntityMediafile(undefined);
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

      document.addEventListener('discard', () => {
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
