<template>
  <Library 
    :hasSimpleSearch="false"
    :search-input-type-on-drawer="SearchInputType.AdvancedInputMediaFilesType"
    :search-input-type="SearchInputType.AdvancedInputMediaFilesType"
    :list-item-route-name="'SingleMediafile'"
    :search-placeholder="'Search Mediafiles...'"
    :advanced-filters-choice="'mediaFileFilters'"
    :enable-selection="enableSelection"
    @add-selection="addSelection"
  />
</template>

<script lang="ts">
  import Library from '@/components/base/Library.vue';
  import { defineComponent } from 'vue';
  import { SearchInputType } from '@/queries';
import useMetaDataHelper from '@/composables/useMetaDataHelper';
import useMediaAssetLinkHelper from '@/composables/useMediaAssetLinkHelper';
import { useUploadModal } from './UploadModal.vue';

  export default defineComponent({
    name: 'MediaFileLibrary',
    components: {
      Library
    },
    props: {
      enableSelection: {
        type: Boolean,
        default: false,
      },
    },
    setup: () => {
      console.log('Logging console...');
      const { mediafiles } = useMetaDataHelper();
      const { addMediaFileToLinkList } = useMediaAssetLinkHelper();
      const { closeUploadModal } = useUploadModal();

      const addSelection = (entity: any) => {
        const mediafile = JSON.parse(JSON.stringify(entity.media.mediafiles[0]));
        mediafiles.value.push(mediafile);
        addMediaFileToLinkList(mediafile);
        closeUploadModal();
      };

      return {
        SearchInputType,
        addSelection
      };
    },
  });
</script>
