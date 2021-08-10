<template>
  <div class="h-full w-full flex relative">
    <IIIFViewer
      v-if="!loading && result.Entity.mediafiles?.[0]"
      :image-url="result.Entity.mediafiles[0].original_file_location"
    />
    <MetaView
      :loading="loading"
      :metadata="result?.Entity.metadata"
      :edit-mode="editMode"
    />
  </div>
</template>

<script lang="ts">
  import { defineComponent, onMounted, ref, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { useMutation, useQuery } from '@vue/apollo-composable';
  import { diff } from 'just-diff';

  import IIIFViewer from '@/components/IIIFViewer.vue';
  import MetaView from '@/components/MetaView.vue';
  import { GetEntityByIdDocument } from '@/queries';
  import { useUpdatePageTitle } from '@/App.vue';

  export default defineComponent({
    name: 'SingleEntity',
    components: {
      IIIFViewer,
      MetaView,
    },
    setup() {
      const route = useRoute();
      const editMode = ref(false);
      const { result, loading } = useQuery(GetEntityByIdDocument, {
        id: Array.isArray(route.params['id'])
          ? route.params['id'][0]
          : (route.params['id'] as string),
      });
      // const { mutate: addMetadata } = useMutation();

      const updatePageTitle = useUpdatePageTitle();
      onMounted(() => updatePageTitle(result.value?.Entity?.title[0]?.value));
      watch(result, (value) => updatePageTitle(value?.Entity?.title[0]?.value));

      return { editMode, result, loading };
    },
  });
</script>
