<template>
  <div class="h-full w-full flex relative">
    <div class="flex w-4/6">
      <IIIFViewer v-if="!loading" :image-url="mediafile?.original_file_location" />
    </div>
    <Meta
      class="w-2/6"
      :entity-id="entityId"
      :metadata="metadata"
      :edit-mode="editMode"
      :entity-title="title"
    />
  </div>
</template>

<script lang="ts">
  import { computed, defineComponent, watch } from 'vue';
  import { useQuery } from '@vue/apollo-composable';
  import IIIFViewer from '@/components/IIIFViewer.vue';
  import Meta from '@/components/Meta.vue';
  import { GetEntityByIdDocument } from '@/queries';
  import { usePageTitle } from '@/components/TheHeader.vue';
  import { EditModes, useEditMode } from '@/components/EditToggle.vue';
  import useRouteHelpers from '@/composables/useRouteHelpers';

  export default defineComponent({
    name: 'SingleEntity',
    components: { IIIFViewer, Meta },
    setup() {
      const { editMode } = useEditMode();
      const { getParam } = useRouteHelpers();
      const id = getParam('id');
      const { result, loading, refetch } = useQuery(GetEntityByIdDocument, { id });
      const title = computed(() => result.value?.Entity?.title[0]?.value);

      const { updatePageTitle } = usePageTitle();

      watch(title, (value: string | undefined) => {
        value && updatePageTitle(value);
      });

      watch(editMode, (value: EditModes) => {
        if (value === 'view') {
          refetch();
        }
      });

      return {
        editMode,
        loading,
        title,
        metadata: computed(() => result?.value?.Entity?.metadata || []),
        mediafile: computed(() => result?.value?.Entity?.mediafiles?.[0]),
        entityId: computed(() => {
          return id;
        }),
      };
    },
  });
</script>
