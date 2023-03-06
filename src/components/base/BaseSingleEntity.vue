<template>
  <div
    v-if="!loading"
    class="pl-24 h-full w-full flex fixed top-0 bg-neutral-0 pt-24 left-0"
  >
    <media-viewer
      v-show="
        (!loading && isSelectionDisplayed && mediafiles.length > 0) ||
        (editMode === 'edit' && mustShowEntityMediafileSelector(result.Entity))
      "
      :loading="loading"
      :entityType="entityType"
    />
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
      :intial-values="result?.Entity?.intialValues"
    />
    <linked-assets-list
      v-if="linkedAssets.length > 0"
      :linked-assets="linkedAssets"
    />
  </div>
  <div
    v-else
    class="h-full w-full flex fixed top-0 bg-neutral-0 pt-24 pl-20 left-0 animate-pulse text-neutral-20"
  />
</template>

<script lang="ts">
import { computed, defineComponent, watch, ref, reactive } from "vue";
import type { PropType } from "vue";
import { useQuery } from "@vue/apollo-composable";
import MetaWindow from "../MetaWindow.vue";
import MediaViewer from "./Mediaviewer.vue";
import { GetEntityByIdDocument } from "../../generated-types/queries";
import type {
  GetEntityByIdQuery,
  Maybe,
  MediaFile,
  GetEntityByIdQueryVariables,
  Entity,
} from "../../generated-types/queries";
import { usePageInfo } from "../../composables/usePageInfo";
import { useEditMode } from "../../composables/useEdit";
import { useEntityMediafileSelector } from "../EntityImageSelection.vue";
import { useRoute, onBeforeRouteUpdate } from "vue-router";
import { asString } from "@/helpers";
import useMetaDataHelper from "../../composables/useMetaDataHelper";
import LinkedAssetsList from "../LinkedAssetsList.vue";
import { usePermissions } from "../../composables/usePermissions";

export default defineComponent({
  name: "SingleEntity",
  components: {
    MetaWindow,
    MediaViewer,
    LinkedAssetsList,
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
    const { lastAdjustedMediaFileMetaData, mediafiles, clearMediafiles } =
      useMetaDataHelper();
    const id = asString(useRoute().params["id"]);
    const loading = ref<boolean>(true);
    const {
      mediafileSelectionState,
      updateSelectedEntityMediafile,
      mustShowEntityMediafileSelector,
    } = useEntityMediafileSelector();

    const { editMode, showEditToggle } = useEditMode();
    const { updatePageInfo } = usePageInfo();
    const { canEdit, canDelete } = usePermissions();

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

    watch(title, (value: Maybe<string> | undefined) => {
      value && updatePageInfo(value, "entityTitle");
    });

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
      mustShowEntityMediafileSelector,
    };
  },
});
</script>
