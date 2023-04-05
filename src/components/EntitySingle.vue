<template>
  <div>
    <div
      v-if="!loading"
      class="pl-24 h-full w-full flex fixed top-0 bg-neutral-lightest pt-24 left-0"
    >
      <entity-form
        v-if="intialValues != 'no-values'"
        :intialValues="intialValues"
        :entityId="id"
        :refetch="refetch"
      >
        <entity-column
          v-if="columnList != 'no-values'"
          :columnList="columnList"
        ></entity-column>
      </entity-form>
    </div>
    <div
      v-else
      class="h-full w-full flex fixed top-0 bg-neutral-0 pt-24 pl-20 left-0 animate-pulse text-neutral-20"
    />
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { asString } from "@/helpers";
import { useRoute, onBeforeRouteUpdate } from "vue-router";
import {
  Entitytyping,
  GetEntityByIdDocument,
  type ColumnList,
  type Entity,
  type GetEntityByIdQuery,
  type GetEntityByIdQueryVariables,
  type IntialValues,
} from "@/generated-types/queries";
import { useQuery } from "@vue/apollo-composable";
import EntityColumn from "./EntityColumn.vue";
import { useAuth } from "session-vue-3-oidc-library";
import useEditMode from "@/composables/useEdit";
import useMetaDataHelper from "@/composables/useMetaDataHelper";
import { useEntityMediafileSelector } from "./EntityImageSelection.vue";
import EntityForm from "./EntityForm.vue";
import { usePageInfo } from "@/composables/usePageInfo";

const props = withDefaults(
  defineProps<{
    entityType: Entitytyping;
  }>(),
  {
    entityType: Entitytyping.Asset,
  }
);

const id = asString(useRoute().params["id"]);
const loading = ref<boolean>(true);
const auth = useAuth();
const { showEditToggle } = useEditMode();
const { updatePageInfo } = usePageInfo();

//Old mediafile dependencies
const { mediafiles, clearMediafiles } = useMetaDataHelper();
const {
  mediafileSelectionState,
  updateSelectedEntityMediafile,
  setEntityMediafiles,
} = useEntityMediafileSelector();
//End old mediafile dependencies

const queryVariables = reactive<GetEntityByIdQueryVariables>({
  id: id,
  type: props.entityType,
});

const { onResult, refetch } = useQuery<GetEntityByIdQuery>(
  GetEntityByIdDocument,
  queryVariables,
  {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "no-cache",
  }
);

onBeforeRouteUpdate(async (to: any) => {
  queryVariables.id = to.params.id;
  intialValues.value = "no-values";
  columnList.value = "no-values";
});

const intialValues = ref<Omit<IntialValues, "keyValue"> | "no-values">(
  "no-values"
);
const columnList = ref<ColumnList | "no-values">("no-values");

onResult((queryResults) => {
  //TEMP: check if it's an asset or mediafile
  try {
    const entity = queryResults.data.Entity;
    const acceptedTypes = ["Asset", "MediaFileEntity", "Manifest"];
    if (acceptedTypes.includes(entity?.__typename)) {
      intialValues.value = entity.intialValues;
      columnList.value = entity.entityView;
      //If logged in set edit mode -> need to check permissions if enabled
      if (auth.isAuthenticated.value === true) {
        showEditToggle("edit");
      }

      //TEMP: set page title
      updatePageInfo(entity.intialValues.title, "entityTitle");

      //Old medafile code
      clearMediafiles();
      if (
        entity &&
        entity.media?.mediafiles &&
        entity.media?.mediafiles?.length > 0
      ) {
        setEntityMediafiles(entity.media.mediafiles);
        let mediaFileChanged: boolean = false;
        entity.media.mediafiles?.forEach((mediafile: any) => {
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
      //End old mediafile code

      loading.value = false;
    } else {
      throw new Error("no assets");
    }
  } catch (error) {
    console.error("no assets");
  }
});
</script>
