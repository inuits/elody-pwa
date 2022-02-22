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
      <IIIFViewer
        v-if="!loading && selectedMediafile !== null"
        :image-url="selectedMediafile?.filename"
        :image-meta-data="selectedMediafile.metadata"
      />
    </div>
    <Meta
      :class="!loading && mediafiles.length > 0 ? 'w-2/6' : 'w-full'"
      :loading="loading"
      :entity-id="result ? result.Entity.id : undefined"
      :metadata="result ? result.Entity.metadata : []"
      :entity-title="title"
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

  export default defineComponent({
    name: 'SingleEntity',
    components: { IIIFViewer, EntityImageSelection, Meta },
    setup() {
      const id = asString(useRoute().params['id']);
      const loading = ref<boolean>(true);
      const selectedMediafile = ref<MediaFile | null>(null);
      const mediafiles = ref<MediaFile[]>([]);
      const { editMode } = useEditMode();
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
          queryResult.data.Entity.media.mediafiles?.forEach((mediafile) => {
            if (mediafile?.__typename === 'MediaFile') {
              if (selectedMediafile.value === null) {
                selectedMediafile.value = mediafile;
              }
              mediafiles.value.push(mediafile);
            }
          });
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
