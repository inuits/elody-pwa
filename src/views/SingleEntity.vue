<template>
  <div class="h-full w-full flex relative">
    <entity-image-selection
      v-show="loading || mediafiles.length > 0"
      v-model:selectedImage="mediafile"
      class="w-40"
      :loading="loading"
      :mediafiles="mediafiles"
    />
    <div
      v-show="!loading && mediafiles.length > 0"
      :class="['flex w-4/6', { checkboard: loading }]"
    >
      <IIIFViewer v-if="!loading" :image-url="mediafile" />
    </div>
    <Meta
      :class="!loading && mediafiles.length > 0 ? 'w-2/6' : 'w-full'"
      :loading="loading"
      :entity-id="entityId"
      :metadata="metadataCollection"
      :entity-title="title"
    />
  </div>
  <PickAssetModal :entity-id="entityId" @update-entity="updateEntities" />
</template>

<script lang="ts">
  import { computed, defineComponent, watch, ref } from 'vue';
  import { useQuery } from '@vue/apollo-composable';
  import IIIFViewer from '@/components/IIIFViewer.vue';
  import Meta from '@/components/Meta.vue';
  import { GetEntityByIdDocument, Maybe, MediaFile, MetadataCollection } from '@/queries';
  import { usePageTitle } from '@/components/TheHeader.vue';
  import { EditModes, useEditMode } from '@/components/EditToggle.vue';
  import useRouteHelpers from '@/composables/useRouteHelpers';
  import EntityImageSelection from '@/components/EntityImageSelection.vue';
  import { useRoute } from 'vue-router';
  import PickAssetModal from '@/components/PickAssetModal.vue';

  export default defineComponent({
    name: 'SingleEntity',
    components: { IIIFViewer, Meta, PickAssetModal, EntityImageSelection },
    setup() {
      const route = useRoute();
      const { editMode } = useEditMode();
      const { getParam } = useRouteHelpers();
      const id = ref<string>(getParam('id'));
      //For some reason loading from useQuery is not working
      const loading = ref<boolean>(true);
      const { result, refetch, onResult } = useQuery(GetEntityByIdDocument, {
        id: id.value,
      });
      const title = computed(() => result.value?.Entity?.title[0]?.value);
      const mediafile = ref<Maybe<string> | undefined>();
      const mediafiles = ref<MediaFile[]>([]);
      const metadataCollection = ref<MetadataCollection[]>([]);
      const { updatePageTitle } = usePageTitle();

      watch(title, (value: Maybe<string> | undefined) => {
        value && updatePageTitle(value);
      });

      watch(editMode, (value: EditModes) => {
        if (value === 'view') {
          refetch();
        }
      });

      const updateEntities = () => {
        refetch();
      };

      watch(
        () => route.params.id,
        async (newId) => {
          if (!Array.isArray(newId)) {
            loading.value = true;
            id.value = newId;
            refetch({
              id: newId,
            });
          }
        },
      );

      onResult((queryResult) => {
        if (queryResult.data && queryResult.data.Entity?.mediafiles?.[0]) {
          mediafile.value = queryResult.data.Entity?.mediafiles?.[0].filename;
        }

        //@ts-ignore
        metadataCollection.value = queryResult?.data?.Entity?.metadataCollection || [];
        //@ts-ignore
        mediafiles.value = queryResult.data.Entity?.mediafiles
          ? queryResult.data.Entity?.mediafiles
          : [];
        loading.value = false;
      });

      return {
        loading,
        title,
        mediafiles,
        mediafile,
        metadataCollection,
        entityId: computed(() => {
          return id.value;
        }),
        updateEntities,
      };
    },
  });
</script>
