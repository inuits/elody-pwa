<template>
  <div class="h-full w-full flex relative">
    <div v-if="mediafile" :class="editMode ? 'w-3/6' : 'w-4/6'">
      <IIIFViewer :image-url="mediafile?.original_file_location" />
    </div>
    <div :class="editMode ? 'w-3/6' : 'w-2/6'">
      <IconToggle
        v-model:checked="editMode"
        :icon-on="Unicons.Edit.name"
        :icon-off="Unicons.Eye.name"
      />
      <MetaView
        :edit-mode="editMode"
        :loading="loading"
        :metadata="metadata"
        :start-edit="startEdit"
        :discard-edit="discardEdit"
        :save-edit="saveEdit"
      />
    </div>
  </div>
</template>

<script lang="ts">
  import { computed, defineComponent, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { useMutation, useQuery } from '@vue/apollo-composable';

  import IIIFViewer from '@/components/IIIFViewer.vue';
  import IconToggle from '@/components/base/IconToggle.vue';
  import MetaView from '@/components/MetaView.vue';
  import { GetEntityByIdDocument, EditMetadataDocument, MetadataInput } from '@/queries';
  import { usePageTitle } from '@/App.vue';
  import { Unicons } from '@/types';

  const asString = (x: string | string[]) => (Array.isArray(x) ? x[0] : x);

  export default defineComponent({
    name: 'SingleEntity',
    components: { IIIFViewer, IconToggle, MetaView },
    setup() {
      const editMode = ref(false);
      const id = asString(useRoute().params['id']);
      const { result, loading, refetch } = useQuery(GetEntityByIdDocument, { id });
      const { mutate } = useMutation(EditMetadataDocument);

      usePageTitle(computed(() => result.value?.Entity?.title[0]?.value));
      return {
        Unicons,
        editMode,
        loading,
        metadata: computed(() => result?.value?.Entity?.metadata || []),
        mediafile: computed(() => result?.value?.Entity?.mediafiles?.[0]),
        startEdit: () => (editMode.value = true),
        discardEdit: () => (editMode.value = false),
        async saveEdit(metadata: MetadataInput[]) {
          await mutate({ id, metadata });
          await refetch();
          editMode.value = false;
        },
      };
    },
  });
</script>
