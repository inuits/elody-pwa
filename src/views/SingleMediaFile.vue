<template>
  <BaseSingleEntity
    :isSelectionDisplayed="false"
    :isMetaDisplayed="false"
    :isMediaFileSingle="true"
    :entityType="'MediaFile'"
    :linkedAssets="linkedAssets"
  />
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import BaseSingleEntity from "@/components/base/BaseSingleEntity.vue";
import { useMutation } from "@vue/apollo-composable";
import { GetAssetsRelationedWithMediafFileDocument } from "@/queries";
import type {
  GetAssetsRelationedWithMediafFileMutation,
  Entity,
} from "@/queries";
import { useRoute } from "vue-router";

export default defineComponent({
  name: "SingleMediaFile",
  components: {
    BaseSingleEntity,
  },
  setup() {
    const route = useRoute();
    const linkedAssets = ref<Array<Entity>>([]);
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
    };
  },
});
</script>
