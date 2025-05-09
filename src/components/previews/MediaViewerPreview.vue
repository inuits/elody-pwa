<template>
  <div class="h-[62vh]">
    <MediaViewer
      :mediafiles="mediafiles"
    />
  </div>
</template>

<script setup lang="ts">


import {
  type Entity,
  type MediaFileEntity,
  FetchMediafilesOfEntityDocument,
} from "@/generated-types/queries";
import { apolloClient } from "@/main";
import { ref, watch } from "vue";
import MediaViewer from "@/components/base/MediaViewer.vue";

const props = withDefaults(
  defineProps<{
    entities: Entity[];
    previewForEntity: string | undefined;
  }>(),
  {
  },
);

const mediafiles = ref<MediaFileEntity[]>([]);

const getMediafilesOfEntity = async () => {
  apolloClient
    .query({
      query: FetchMediafilesOfEntityDocument,
      variables: { entityIds: [props.previewForEntity] },
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
    })
    .then((result) => {
      mediafiles.value = result.data.FetchMediafilesOfEntity;
    });
};

watch(
  () => props.previewForEntity,
  () => {
    getMediafilesOfEntity();
  },
  { immediate: true }
)

</script>

<style scoped>
</style>