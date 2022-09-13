<template>
  <BaseSingleEntity :isSelectionDisplayed="false" :isMetaDisplayed="false" :isMediaFileSingle="true" :entityType="'MediaFile'" :linkedAssets="linkedAssets" />
</template>

<script lang="ts">
  import { defineComponent, ref } from 'vue';
  import BaseSingleEntity from '@/components/base/BaseSingleEntity.vue';
  import { useMutation } from '@vue/apollo-composable';
  import {
    GetAssetsRelationedWithMediafFileMutation,
    GetAssetsRelationedWithMediafFileDocument,
    Entity,
  } from '@/queries';
  export default defineComponent({
    name: 'SingleMediaFile',
    components: {
      BaseSingleEntity
    },
    setup() {
      const linkedAssets = ref<Array<Entity>>([]);
      const { mutate, onDone } = useMutation<GetAssetsRelationedWithMediafFileMutation>(GetAssetsRelationedWithMediafFileDocument); 
      mutate({mediaFileId: '08770858-3911-4552-ab8d-22a0259d25e2'});

      onDone((result: any) => {
        linkedAssets.value = result.data.getAssetsRelationedWithMediafFile;
      });
      return {
        linkedAssets
      };
    },
  });
</script>
