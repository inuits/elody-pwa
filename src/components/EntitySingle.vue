<template>
  <div
    v-if="!loading"
    class="pl-24 h-full w-full flex fixed top-0 bg-neutral-0 pt-24 left-0"
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
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import { asString } from "@/helpers";
import { useRoute, onBeforeRouteUpdate } from "vue-router";
import {
  GetEntityByIdDocument,
  type ColumnList,
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

const id = asString(useRoute().params["id"]);
const loading = ref<boolean>(true);
const auth = useAuth();
const { showEditToggle } = useEditMode();

//Old mediafile dependencies
const { mediafiles, clearMediafiles } = useMetaDataHelper();
const { mediafileSelectionState, updateSelectedEntityMediafile } =
  useEntityMediafileSelector();
//End old mediafile dependencies

const queryVariables = reactive<GetEntityByIdQueryVariables>({
  id: id,
  type: "Entity",
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

const intialValues = ref<IntialValues | "no-values">("no-values");
const columnList = ref<ColumnList | "no-values">("no-values");

onResult((queryResults) => {
  //TEMP: check if it's an asset
  try {
    if (
      queryResults.data.Entity &&
      queryResults.data.Entity.__typename === "Asset"
    ) {
      intialValues.value = queryResults.data.Entity.intialValues;
      columnList.value = queryResults.data.Entity.entityView;
      //If logged in set edit mode -> need to check permissions if enabled
      if (auth.isAuthenticated.value === true) {
        showEditToggle("edit");
      }

      //Old medafile code
      clearMediafiles();
      if (
        queryResults.data &&
        queryResults.data.Entity?.media?.mediafiles &&
        queryResults.data.Entity?.media?.mediafiles?.length > 0
      ) {
        let mediaFileChanged: boolean = false;
        queryResults.data.Entity.media.mediafiles?.forEach((mediafile: any) => {
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
