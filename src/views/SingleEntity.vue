<template>
  <div class="h-full w-full flex relative">
    <div class="flex w-4/6">
      <IIIFViewer :image-url="mediafile?.original_file_location" />
      <div v-if="editMode" class="absolute bottom-6 z-20 flex flex-column rounded gap-x-2 bg-neutral-0 shadow-2xl px-4 py-2 ml-6">
        <BaseButton :bgColor="'blue-400'" :txtColor="'neutral-0'" label="Save" @click="discard()" />
        <BaseButton label="Discard" bgColor="'neutral-0'" :borderColor="'red-default'" :txtColor="'red-default'" @click="save()" />
      </div>
    </div>
    <Meta class="w-2/6" :entityId="entityId" :metadata="metadata" :editMode="editMode"/>
  </div>
</template>

<script lang="ts">
  import { computed, defineComponent, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { useMutation, useQuery } from '@vue/apollo-composable';

  import BaseButton from '@/components/base/BaseButton.vue';
  import IIIFViewer from '@/components/IIIFViewer.vue';
  import Meta from '@/components/Meta.vue';
  import { GetEntityByIdDocument, EditMetadataDocument, MetadataInput, Metadata } from '@/queries';
  import { usePageTitle } from '@/App.vue';
  import { Unicons } from '@/types';

  const asString = (x: string | string[]) => (Array.isArray(x) ? x[0] : x);

  export default defineComponent({
    name: 'SingleEntity',
    components: { IIIFViewer, BaseButton, Meta },
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
        async save(metadata: Metadata[]) {
          await mutate({ id, metadata });
          await refetch();
          editMode.value = false;
        },
        entityId: computed(() => {return id;}),
      };
    },
  });
</script>
