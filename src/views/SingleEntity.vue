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
      <MetaEdit
        v-if="editMode"
        :error="error"
        :loading="loading"
        :metadata="metadata"
        :discard="discard"
        :save="save"
      />
      <MetaView v-else :loading="loading" :metadata="metadata" />
    </div>
  </div>
</template>

<script lang="ts">
  import { computed, defineComponent, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { useMutation, useQuery } from '@vue/apollo-composable';

  import IIIFViewer from '@/components/IIIFViewer.vue';
  import IconToggle from '@/components/base/IconToggle.vue';
  import MetaEdit from '@/components/MetaEdit.vue';
  import MetaView from '@/components/MetaView.vue';
  import { GetEntityByIdDocument, EditMetadataDocument, MetadataInput } from '@/queries';
  import { usePageTitle } from '@/App.vue';
  import { Unicons } from '@/types';

  const asString = (x: string | string[]) => (Array.isArray(x) ? x[0] : x);

  export default defineComponent({
    name: 'SingleEntity',
    components: { IIIFViewer, IconToggle, MetaEdit, MetaView },
    setup() {
      const editMode = ref(false);
      const id = asString(useRoute().params['id']);
      const { result, error, loading, refetch } = useQuery(GetEntityByIdDocument, { id });
      const { mutate } = useMutation(EditMetadataDocument);

      usePageTitle(computed(() => result.value?.Entity?.title[0]?.value));
      return {
        Unicons,
        editMode,
        loading,
        error,
        metadata: computed(() => result?.value?.Entity?.metadata || []),
        mediafile: computed(() => result?.value?.Entity?.mediafiles?.[0]),
        discard: () => (editMode.value = false),
        async save(metadata: MetadataInput[]) {
          await mutate({ id, metadata });
          await refetch();
          editMode.value = false;
        },
      };
    },
  });
</script>
