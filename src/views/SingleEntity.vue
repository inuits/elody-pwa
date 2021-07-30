<template>
  <div class="h-full w-full flex relative">
    <i-i-i-f-viewer
      v-if="!loading && result.Entity.mediafiles && result.Entity.mediafiles[0]"
      :image-url="result.Entity.mediafiles[0].location"
    />
    <meta-view v-if="!loading && result.Entity.metadata" :meta="result.Entity.metadata" />
  </div>
</template>

<script lang="ts">
  import { defineComponent, watch, inject, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import { useQuery } from '@vue/apollo-composable';

  import IIIFViewer from '@/components/IIIFViewer.vue';
  import MetaView from '@/components/MetaView.vue';
  import { GetEntityByIdDocument } from '@/queries';
  import { updatePageTitleType } from '@/App.vue';

  export default defineComponent({
    name: 'SingleEntity',
    components: {
      IIIFViewer,
      MetaView,
    },
    setup: () => {
      const route = useRoute();
      const updatePageTitle: updatePageTitleType | undefined = inject('updatePageTitle');

      const { result, loading } = useQuery(GetEntityByIdDocument, {
        id: Array.isArray(route.params['id']) ? route.params['id'][0] : (route.params['id'] as string),
      });

      watch(result, (value) => {
        const title = value?.Entity?.title[0]?.value;
        updatePageTitle && title && updatePageTitle(title);
      });

      onMounted(() => {
        const title = result.value?.Entity?.title[0]?.value;
        updatePageTitle && title && updatePageTitle(title);
      });

      return { result, loading };
    },
  });
</script>
