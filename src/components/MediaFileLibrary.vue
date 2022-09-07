<template>
  <Library 
    :hasSimpleSearch="false"
    :SearchInputTypeOnDrawer="SearchInputType.AdvancedInputMediaFilesType"
    :SearchInputType="SearchInputType.AdvancedInputMediaFilesType"
    :listItemRouteName="'SingleMediafile'"
    :searchPlaceholder="'Search Mediafiles...'"
    :advancedFiltersChoice="'mediaFileFilters'"
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
      const { mediafiles } = useMetaDataHelper();
      const { addMediaFileToLinkList } = useMediaAssetLinkHelper();
      const { closeUploadModal } = useUploadModal();

      const addSelection = (entity: any) => {
        console.log('ADD SELECTION: ', entity.media.mediafiles[0]);
        mediafiles.value.push(entity.media.mediafiles[0]);
        addMediaFileToLinkList(entity.media.mediafiles[0]);
        closeUploadModal();
      };

      return {
        SearchInputType,
        addSelection
      };
    },
  });
</script>
