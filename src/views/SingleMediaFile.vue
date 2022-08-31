<template>
  <div
    v-if="!loading"
    class="h-full w-full flex fixed top-0 bg-neutral-0 pt-24 pl-20 left-0"
  >
    <!-- <div v-if="result">
      {{result.MediaFile}}
    </div> -->
    <div
      v-show="!loading && result"
      :class="['flex w-4/6 justify-center ', { checkboard: loading }]"
    >
      <IIIFViewer
        v-if="
          !loading &&
          result.MediaFile !== undefined &&
          result.MediaFile.mimetype.includes('image')
        "
        :is-public="result.MediaFile.isPublic"
        :image-url="result.MediaFile.filename"
        :image-transcode-url="
          result.MediaFile.transcode_filename
        "
      />
      <!-- <VideoPlayer
        v-if="
          !loading &&
          result.MediaFile !== undefined &&
          result.MediaFile.mimetype.includes('video')
        "
        :source="result.MediaFile"
      /> -->
      <!-- <AudioPlayer
        v-if="
          !loading &&
          result.MediaFile !== undefined &&
          result.MediaFile.mimetype.includes('audio')
        "
        :source="result.MediaFile"
      /> -->
      <!-- <PDFViewer
        v-if="
          !loading &&
          result.MediaFile !== undefined &&
          result.MediaFile.mimetype.includes('pdf')
        "
        :source="result.MediaFile"
      /> -->
    </div>
    <!-- <Meta
      :class="!loading ? 'w-2/6' : 'w-full'"
      :loading="loading"
      :entity-id="result ? result.MediaFile.id : undefined"
      :metadata="result ? result.MediaFile.metadata : []"
      :entity-title="title"
      :form="result?.MediaFile?.form"
    /> -->
  </div>
</template>

<script lang="ts">
  import { defineComponent, ref, reactive } from 'vue';
  import { useQuery } from '@vue/apollo-composable';
  import IIIFViewer from '@/components/IIIFViewer.vue';
  import Meta from '@/components/Meta.vue';
  import {
    GetMediaFileByIdQueryVariables,
    GetMediaFileByIdQuery,
    GetMediaFileByIdDocument,
  } from '@/queries';
  import { usePageTitle } from '@/components/TheHeader.vue';
  import { useEditMode } from '@/components/EditToggle.vue';
  import { useRoute, onBeforeRouteUpdate } from 'vue-router';
  import { asString } from '@/helpers';
  // import VideoPlayer from '@/components/base/VideoPlayer.vue'; 
  import AudioPlayer from '@/components/base/AudioPlayer.vue';
  import PDFViewer from '@/components/base/PDFViewer.vue';

  export default defineComponent({
    name: 'SingleMediaFile',
    components: {
      IIIFViewer,
      // Meta,
      // VideoPlayer,
      // AudioPlayer,
      // PDFViewer,
    },
    setup() {
      const id = asString(useRoute().params['id']);
      const loading = ref<boolean>(true);
      const { editMode } = useEditMode();
      const { updatePageTitle } = usePageTitle();
      const queryVariables = reactive<GetMediaFileByIdQueryVariables>({
        id: id,
      });
      
      const { result, refetch, onResult } = useQuery<GetMediaFileByIdQuery>(
        GetMediaFileByIdDocument,
        queryVariables,
        {
          notifyOnNetworkStatusChange: true,
          fetchPolicy: 'no-cache',
        },
      );
      // const title = computed(() => {
      //   if (result.value && result.value.Entity?.title[0]?.__typename === 'Metadata') {
      //     const tileMetada = result.value.Entity?.title[0];
      //     return tileMetada.value;
      //   }
      //   return undefined;
      // });

      // watch(title, (value: Maybe<string> | undefined) => {
      //   value && updatePageTitle(value, 'entityTitle');
      // });

      onBeforeRouteUpdate(async (to, from) => {
        //@ts-ignore
        queryVariables.id = to.params.id;
      });

      document.addEventListener('save', () => {
        refetch();
      });

      document.addEventListener('discard', () => {
        refetch();
      });

      onResult(() => {
        loading.value = false;
      });

      return {
        result,
        loading,
        // title,
        editMode,
      };
    },
  });
</script>
