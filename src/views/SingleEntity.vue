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
      :class="['flex w-4/6', { checkboard: loading }]"
    >
<<<<<<< Updated upstream
      <VideoPlayer
        v-if="
          !loading &&
          selectedMediafile !== null &&
          selectedMediafile.filename?.includes('.mp4')
        "
        :uri="selectedMediafile.filename"
      />
=======
      <AudioPlayer
        v-if="selectedMediafile.filename?.includes('mp3')"
        :source="selectedMediafile?.filename"
        :type="selectedMediafile?.mediatype"
      />
      <!-- videoplayer   v-if="selectedMediafile?.filename.includes('.mp4')"-->
>>>>>>> Stashed changes
      <IIIFViewer
        v-if="
          !loading &&
          selectedMediafile !== null &&
          !selectedMediafile?.filename.includes('.mp4') &&
          !selectedMediafile?.filename.includes('.mp3')
        "
        :image-url="selectedMediafile?.filename"
        :image-meta-data="selectedMediafile.metadata"
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
  <!-- <PickAssetModal :entity-id="entityId" @update-entity="updateEntities" /> -->
</template>

<script lang="ts">
  import { computed, defineComponent, watch, ref } from 'vue';
  import { useQuery } from '@vue/apollo-composable';
  import IIIFViewer from '@/components/IIIFViewer.vue';
  import Meta from '@/components/Meta.vue';
  import { GetEntityByIdDocument, GetEntityByIdQuery, Maybe, MediaFile } from '@/queries';
  import { usePageTitle } from '@/components/TheHeader.vue';
  import { EditModes, useEditMode } from '@/components/EditToggle.vue';
  import EntityImageSelection from '@/components/EntityImageSelection.vue';
  import { useRoute } from 'vue-router';
  // import PickAssetModal from '@/components/PickAssetModal.vue';
  import { asString } from '@/helpers';
<<<<<<< Updated upstream
  import VideoPlayer from '@/components/base/VideoPlayer.vue';
  export default defineComponent({
    name: 'SingleEntity',
    components: {
      IIIFViewer,
      EntityImageSelection,
      Meta,
      VideoPlayer,
    },
=======
  import AudioPlayer from '@/components/base/AudioPlayer.vue';

  export default defineComponent({
    name: 'SingleEntity',
    components: { IIIFViewer, EntityImageSelection, Meta, AudioPlayer },
>>>>>>> Stashed changes
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

      watch(editMode, (value: EditModes) => {
        if (value === 'view') {
          refetch();
        }
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
        console.log(queryResult.data.Entity?.form);
        //If form show edit togle
        if (queryResult.data.Entity?.form) {
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
        updateEntities,
      };
    },
  });
</script>
