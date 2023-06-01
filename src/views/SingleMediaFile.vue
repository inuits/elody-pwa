<template>
  <BaseSingleEntity
    v-if="useOldComponent"
    :isSelectionDisplayed="false"
    :isMetaDisplayed="false"
    :isMediaFileSingle="true"
    :entityType="Entitytyping.Mediafile"
    :linkedAssets="linkedAssets"
  />
  <entity-single v-else :entityType="Entitytyping.Mediafile"></entity-single>
</template>

<script lang="ts">
import { defineComponent, ref, inject } from "vue";
import BaseSingleEntity from "../components/base/BaseSingleEntity.vue";
import { useMutation } from "@vue/apollo-composable";
import {
  Entitytyping,
  GetAssetsRelationedWithMediafFileDocument,
} from "../generated-types/queries";
import type {
  GetAssetsRelationedWithMediafFileMutation,
  Entity,
} from "../generated-types/queries";
import { useRoute } from "vue-router";
import EntitySingle from "./EntitySingle.vue";

export default defineComponent({
  name: "SingleMediaFile",
  components: {
    BaseSingleEntity,
    EntitySingle,
  },
  setup() {
    const route = useRoute();
    const linkedAssets = ref<Array<Entity>>([]);
    const config: any = inject("config");
    const useOldComponent = config.features.useOldSingleEntityComponent;
    const { mutate, onDone } =
      useMutation<GetAssetsRelationedWithMediafFileMutation>(
        GetAssetsRelationedWithMediafFileDocument
      );
    mutate({ mediaFileId: route.params["id"] });

    onDone((result: any) => {
      linkedAssets.value = result.data.getAssetsRelationedWithMediafFile;
    });
    return {
      linkedAssets,
      useOldComponent,
      Entitytyping,
    };
  },
});
</script>
