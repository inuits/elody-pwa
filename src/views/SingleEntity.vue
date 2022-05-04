<template>
  <div class="h-full w-full flex fixed top-0 bg-neutral-0 pt-24 pl-20 left-0">
    <entity-image-selection
      v-show="loading || mediafiles.length > 0"
      v-model:selectedImage="selectedMediafile"
      class="w-40"
      :loading="loading"
      :mediafiles="mediafiles"
    />

    <div
      v-show="!loading && mediafiles.length > 0"
      :class="['flex w-4/6 justify-center ', { checkboard: loading }]"
    >
      <IIIFViewer
        v-if="
          !loading &&
          selectedMediafile !== null &&
          selectedMediafile.mimetype.includes('image')
        "
        :image-url="selectedMediafile.filename"
        :image-meta-data="selectedMediafile.metadata"
      />

      <VideoPlayer
        v-if="
          !loading &&
          selectedMediafile !== null &&
          selectedMediafile.mimetype.includes('video')
        "
        :source="selectedMediafile"
      />
      <AudioPlayer
        v-if="
          !loading &&
          selectedMediafile !== null &&
          selectedMediafile.mimetype.includes('audio')
        "
        :source="selectedMediafile"
      />
      <PDFViewer
        v-if="
          !loading &&
          selectedMediafile !== null &&
          selectedMediafile.mimetype.includes('pdf')
        "
        :source="selectedMediafile"
      />
    </div>
    <!-- meta is metadata form-->
    <Meta
      :class="!loading && mediafiles.length > 0 ? 'w-2/6' : 'w-full'"
      :loading="loading"
      :entity-id="result ? result.Entity.id : undefined"
      :metadata="result ? result.Entity.metadata : []"
      :entity-title="title"
      :form="result?.Entity?.form"
    />
    <button @click="deleteAsset">Delete Asset</button>
  </div>
</template>

<script lang="ts">
  import { computed, defineComponent, watch, ref } from 'vue';
  import { useMutation, useQuery } from '@vue/apollo-composable';
  import IIIFViewer from '@/components/IIIFViewer.vue';
  import Meta from '@/components/Meta.vue';
  import {
    GetEntityByIdDocument,
    GetEntityByIdQuery,
    Maybe,
    MediaFile,
    DeleteDataDocument,
    DeleteDataMutation,
    DeletePaths,
  } from '@/queries';
  import { usePageTitle } from '@/components/TheHeader.vue';
  import { useEditMode } from '@/components/EditToggle.vue';
  import EntityImageSelection from '@/components/EntityImageSelection.vue';
  import { useRoute } from 'vue-router';
  import { asString } from '@/helpers';
  import VideoPlayer from '@/components/base/VideoPlayer.vue';
  import AudioPlayer from '@/components/base/AudioPlayer.vue';
  import PDFViewer from '@/components/base/PDFViewer.vue';

  console.log(process.env.VUE_APP_DOWNLOAD_MEDIAFILE);

  export default defineComponent({
    name: 'SingleEntity',
    components: {
      IIIFViewer,
      EntityImageSelection,
      Meta,
      VideoPlayer,
      AudioPlayer,
      PDFViewer,
    },
    setup() {
      const id = asString(useRoute().params['id']);
      const loading = ref<boolean>(true);
      const selectedMediafile = ref<MediaFile | null>(null);

      const mediafiles = ref<MediaFile[]>([]);
      const { editMode, showEditToggle } = useEditMode();
      const { updatePageTitle } = usePageTitle();

      const { result, refetch, onResult } = useQuery<GetEntityByIdQuery>(
        GetEntityByIdDocument,
        {
          id: id,
        },
        {
          notifyOnNetworkStatusChange: true,
          fetchPolicy: 'no-cache',
        },
      );
      const title = computed(() => {
        if (result.value && result.value.Entity?.title[0]?.__typename === 'Metadata') {
          const tileMetada = result.value.Entity?.title[0];
          return tileMetada.value;
        }
        return undefined;
      });

      watch(title, (value: Maybe<string> | undefined) => {
        value && updatePageTitle(value, 'entityTitle');
      });

      const updateEntities = () => {
        refetch();
      };

      onResult((queryResult) => {
        if (
          queryResult.data &&
          queryResult.data.Entity?.media?.mediafiles &&
          queryResult.data.Entity?.media?.mediafiles?.length > 0
        ) {
          mediafiles.value = [];
          queryResult.data.Entity.media.mediafiles?.forEach((mediafile) => {
            if (mediafile?.__typename === 'MediaFile') {
              if (selectedMediafile.value === null) {
                selectedMediafile.value = mediafile;
              }
              mediafiles.value.push(mediafile);
            }
          });
        }
        //If form show edit togle
        if (queryResult.data.Entity?.form) {
          showEditToggle();
        }

        loading.value = false;
      });

      const { mutate } = useMutation<DeleteDataMutation>(DeleteDataDocument);

      const deleteAsset = () => {
        mutate({ id, path: DeletePaths.Entities });
        //window.history.back();
      };

      return {
        result,
        deleteAsset,
        loading,
        title,
        mediafiles,
        selectedMediafile,
        updateEntities,
      };
    },
  });
</script>
