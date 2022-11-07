<template>
  <div
    v-if="!loading"
    class="pl-24 h-full w-full flex fixed top-0 bg-neutral-0 pt-24 left-0"
  >
    <entity-image-selection
      v-show="
        (!loading && isSelectionDisplayed && mediafiles.length > 0) ||
        editMode === 'edit'
      "
      v-model:selectedImage="mediafileSelectionState.selectedMediafile"
      :class="['w-40', editMode === 'edit' ? 'shadow-md' : '']"
      :loading="loading"
    />
    <div
      v-show="!loading && mediafileSelectionState.selectedMediafile"
      :class="[
        'justify-center ',
        { checkboard: loading },
        entityType === 'MediaFile' ? 'w-full' : 'flex w-4/6',
      ]"
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
        :downloadLocation="
          canGet(result?.Entity?.permission)
            ? mediafileSelectionState.selectedMediafile.original_file_location
            : ''
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
      <SrtViewer
        v-if="
          !loading &&
          mediafileSelectionState.selectedMediafile !== undefined &&
          mediafileSelectionState.selectedMediafile.mimetype.includes(
            'text/plain'
          )
        "
        :source="mediafileSelectionState.selectedMediafile"
      />
    </div>
    <!-- meta is metadata form-->
    <MetaWindow
      v-if="isMetaDisplayed"
      :class="
        !loading && mediafileSelectionState.selectedMediafile
          ? 'w-2/6'
          : 'w-full'
      "
      :loading="loading"
      :entity-id="result ? result?.Entity?.id : undefined"
      :metadata="result ? result?.Entity?.metadata : []"
      :entity-title="title"
      :form="result?.Entity?.form"
    />
    <linked-assets-list
      v-if="linkedAssets.length > 0"
      :linked-assets="linkedAssets"
    />
  </div>
  <div
    v-else
    class="h-full w-full flex fixed top-0 bg-neutral-0 pt-24 pl-20 left-0 animate-pulse bg-neutral-20 text-neutral-20"
  />
</template>

<script lang="ts">
import { computed, defineComponent, watch, ref, reactive } from "vue";
import type { PropType } from "vue";
import { useMutation, useQuery } from "@vue/apollo-composable";
import IIIFViewer from "../IIIFViewer.vue";
import MetaWindow from "../MetaWindow.vue";
import { GetEntityByIdDocument, PostMediaFileDocument } from "../../queries";
import type {
  GetEntityByIdQuery,
  Maybe,
  MediaFile,
  GetEntityByIdQueryVariables,
  Entity,
  PostMediaFileMutation,
} from "../../queries";
import { usePageTitle } from "../../composables/usePageTitle";
import { useEditMode } from "../../composables/useEdit";
import EntityImageSelection, {
  useEntityMediafileSelector,
} from "../EntityImageSelection.vue";
import { useRoute, onBeforeRouteUpdate } from "vue-router";
import { asString } from "../../helpers";
import VideoPlayer from "./VideoPlayer.vue";
import AudioPlayer from "./AudioPlayer.vue";
import PDFViewer from "./PDFViewer.vue";
import useDropzoneHelper from "../../composables/useDropzoneHelper";
import useMediaAssetLinkHelper from "../../composables/useMediaAssetLinkHelper";
import useMetaDataHelper from "../../composables/useMetaDataHelper";
import { useUploadModal } from "../UploadModal.vue";
import SrtViewer from "./SrtViewer.vue";
import LinkedAssetsList from "../LinkedAssetsList.vue";
import { usePermissions } from "../../composables/usePermissions";

export default defineComponent({
  name: "SingleEntity",
  components: {
    IIIFViewer,
    MetaWindow,
    VideoPlayer,
    AudioPlayer,
    PDFViewer,
    LinkedAssetsList,
    SrtViewer,
    EntityImageSelection,
  },
  props: {
    isMetaDisplayed: Boolean,
    isSelectionDisplayed: Boolean,
    entityType: {
      type: String,
      required: true,
    },
    linkedAssets: {
      type: Array as PropType<Entity[]>,
      required: false,
      default: () => {
        return [];
      },
    },
  },
  setup(props) {
    const {
      myDropzone,
      isUploading,
      selectedFiles,
      increaseSuccessCounter,
      errorMessages,
    } = useDropzoneHelper();
    const { addMediaFileToLinkList } = useMediaAssetLinkHelper();
    const { lastAdjustedMediaFileMetaData, mediafiles, clearMediafiles } =
      useMetaDataHelper();
    const id = asString(useRoute().params["id"]);
    const loading = ref<boolean>(true);
    const { mediafileSelectionState, updateSelectedEntityMediafile } =
      useEntityMediafileSelector();

    const { editMode, showEditToggle } = useEditMode();
    const { updatePageTitle } = usePageTitle();
    const { closeUploadModal } = useUploadModal();
    const { canEdit, canDelete, canGet } = usePermissions();

    const queryVariables = reactive<GetEntityByIdQueryVariables>({
      id: id,
      type: props.entityType,
    });

    const { result, refetch, onResult } = useQuery<GetEntityByIdQuery>(
      GetEntityByIdDocument,
      queryVariables,
      {
        notifyOnNetworkStatusChange: true,
        fetchPolicy: "no-cache",
      }
    );

    const title = computed(() => {
      if (
        result.value &&
        result.value.Entity?.title[0]?.__typename === "Metadata"
      ) {
        const tileMetada = result.value.Entity?.title[0];
        return tileMetada.value;
      }
      return undefined;
    });

    const { mutate, onDone } = useMutation<PostMediaFileMutation>(
      PostMediaFileDocument
    );

    watch(title, (value: Maybe<string> | undefined) => {
      value && updatePageTitle(value, "entityTitle");
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
      }
    );

    const updateListWhenChanges = (newValue: any, oldValue: any) => {
      if (
        lastAdjustedMediaFileMetaData.value &&
        oldValue &&
        JSON.stringify(newValue) !== JSON.stringify(oldValue)
      ) {
        const index = mediafiles.value.findIndex(
          (x: MediaFile) =>
            x._id.replace("mediafiles/", "") ===
            lastAdjustedMediaFileMetaData.value.mediafileId
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
      { deep: true }
    );

    onDone((value) => {
      if (value.data && value.data.postMediaFile) {
        mediafiles.value.push(value.data.postMediaFile);
        addMediaFileToLinkList(value.data.postMediaFile);
      }
      increaseSuccessCounter();
    });

    onBeforeRouteUpdate(async (to: any) => {
      //@ts-ignore
      queryVariables.id = to.params.id;
    });

    onResult((queryResult: any) => {
      clearMediafiles();
      if (
        queryResult.data &&
        queryResult.data.Entity?.media?.mediafiles &&
        queryResult.data.Entity?.media?.mediafiles?.length > 0
      ) {
        let mediaFileChanged: boolean = false;
        queryResult.data.Entity.media.mediafiles?.forEach((mediafile: any) => {
          if (mediafile?.__typename === "MediaFile") {
            if (
              mediafile._id == mediafileSelectionState.selectedMediafile?._id
            ) {
              updateSelectedEntityMediafile(mediafile);
              mediaFileChanged = true;
            }
            mediafiles.value.push(mediafile);
          }
        });
        if (!mediaFileChanged && mediafiles.value[0]) {
          updateSelectedEntityMediafile(mediafiles.value[0]);
        }
      } else {
        updateSelectedEntityMediafile(undefined);
      }
      //If form show edit togle
      if (
        queryResult.data.Entity.permission &&
        canDelete(queryResult.data.Entity.permission)
      ) {
        showEditToggle("delete");
      } else if (
        queryResult.data.Entity.permission &&
        canEdit(queryResult.data.Entity.permission)
      ) {
        showEditToggle("edit");
      }

      loading.value = false;
    });

    document.addEventListener("save", () => {
      refetch();
    });

    document.addEventListener("discard", () => {
      refetch();
    });

    return {
      result,
      loading,
      title,
      mediafiles,
      editMode,
      mediafileSelectionState,
      canGet,
    };
  },
});
</script>
