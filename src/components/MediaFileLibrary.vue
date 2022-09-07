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
    setup: (props, { emit }) => {

      const addSelection = (mediaFile: any) => {
        console.log('ADD SELECTION: ', mediaFile);
        emit('addSelection', mediaFile);
      };

      return {
        SearchInputType,
        addSelection
      };
    },
  });
</script>
