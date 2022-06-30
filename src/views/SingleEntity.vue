<template>
  <div
    v-if="!loading"
    class="h-full w-full flex fixed top-0 bg-neutral-0 pt-24 pl-20 left-0"
  >
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
  </div>
</template>

<script lang="ts">
  import { computed, defineComponent, watch, ref, reactive } from 'vue';
  import { useMutation, useQuery } from '@vue/apollo-composable';
  import IIIFViewer from '@/components/IIIFViewer.vue';
  import Meta from '@/components/Meta.vue';
  import {
    GetEntityByIdDocument,
    GetEntityByIdQuery,
    Maybe,
    MediaFile,
    GetEntityByIdQueryVariables,
  } from '@/queries';
  import { usePageTitle } from '@/components/TheHeader.vue';
  import { useEditMode } from '@/components/EditToggle.vue';
  import EntityImageSelection from '@/components/EntityImageSelection.vue';
  import { useRoute, onBeforeRouteUpdate } from 'vue-router';
  import { asString } from '@/helpers';
  import VideoPlayer from '@/components/base/VideoPlayer.vue';
  import AudioPlayer from '@/components/base/AudioPlayer.vue';
  import PDFViewer from '@/components/base/PDFViewer.vue';

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
      const { editMode, showEditToggle, hideEditToggle } = useEditMode();
      const { updatePageTitle } = usePageTitle();

      const queryVariables = reactive<GetEntityByIdQueryVariables>({
        id: id,
      });

      const { result, refetch, onResult } = useQuery<GetEntityByIdQuery>(
        GetEntityByIdDocument,
        queryVariables,
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

      onBeforeRouteUpdate(async (to, from) => {
        //@ts-ignore
        queryVariables.id = to.params.id;
      });

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
        if (queryResult.data && queryResult.data.Entity?.form) {
          showEditToggle();
        } else if (queryResult.data && queryResult.data?.Entity) {
          showEditToggle();
        }

        loading.value = false;
      });

      return {
        result,
        loading,
        title,
        mediafiles,
        selectedMediafile,
        editMode,
      };
    },
  });
</script>
