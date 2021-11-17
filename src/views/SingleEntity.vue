<template>
  <div class="h-full w-full flex relative">
    <entity-components-selection
      class="w-40"
      :loading="loading"
      :entities="components"
      :parents="parents"
      :selected-id="entityId"
      :thumbnail="thumbnail"
      :edit-mode="editMode"
    />
    <div :class="['flex w-4/6', { checkboard: loading }]">
      <IIIFViewer v-if="!loading" :image-url="mediafile" />
    </div>
    <Meta
      class="w-2/6"
      :loading="loading"
      :entity-id="entityId"
      :metadata="metadata"
      :relations="relations"
      :entity-title="title"
    />
  </div>
  <PickAssetModal :entity-id="entityId" />
</template>

<script lang="ts">
  import { computed, defineComponent, watch, ref } from 'vue';
  import { useQuery } from '@vue/apollo-composable';
  import IIIFViewer from '@/components/IIIFViewer.vue';
  import Meta from '@/components/Meta.vue';
  import { GetEntityByIdDocument, GetEntityByIdQuery, Maybe, Metadata, Relation } from '@/queries';
  import { usePageTitle } from '@/components/TheHeader.vue';
  import { EditModes, useEditMode } from '@/components/EditToggle.vue';
  import useRouteHelpers from '@/composables/useRouteHelpers';
  import EntityComponentsSelection from '@/components/EntityComponentsSelection.vue';
  import { useRoute } from 'vue-router';
  import PickAssetModal from '@/components/PickAssetModal.vue';

  export default defineComponent({
    name: 'SingleEntity',
    components: { IIIFViewer, Meta, EntityComponentsSelection, PickAssetModal },
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
      const thumbnail = ref<Maybe<string> | undefined>();
      const metadata = ref<Maybe<Metadata>[]>([]);
      const relations = ref<Maybe<Relation>[]>([]);
      const { updatePageTitle } = usePageTitle();

      watch(title, (value: string | undefined) => {
        value && updatePageTitle(value);
      });

      watch(editMode, (value: EditModes) => {
        if (value === 'view') {
          refetch();
        }
      });

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
        console.log('QueryResult', queryResult);
        if (queryResult.data && queryResult.data.Entity?.mediafiles?.[0]) {
          mediafile.value =
            queryResult.data.Entity?.mediafiles?.[0].original_file_location;
          thumbnail.value =
            queryResult.data.Entity?.mediafiles?.[0].thumbnail_file_location;
        }

        metadata.value = queryResult?.data?.Entity?.metadata || [];
        relations.value = queryResult?.data?.Entity?.relations || [];
        loading.value = false;
      });

      return {
        editMode,
        loading,
        title,
        metadata,
        relations,
        mediafile,
        thumbnail,
        components: computed(() => result?.value?.Entity?.components),
        parents: computed(() => result?.value?.Entity?.parents),
        entityId: computed(() => {
          return id.value;
        }),
      };
    },
  });
</script>
