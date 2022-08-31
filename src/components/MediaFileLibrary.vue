<template>
  <Library 
    :hasSimpleSearch="false" 
    :SearchInputTypeOnDrawer="SearchInputType.AdvancedInputMediaFilesType" 
    :SearchInputType="SearchInputType.AdvancedInputMediaFilesType"
    :listItemRouteName="'SingleMediafile'"
    :searchPlaceholder="'Search Mediafiles...'"
<<<<<<< HEAD
    :advancedFiltersChoice="'mediaFileFilters'"
=======
>>>>>>> WIP Ref: #97062, fix base library props and made BaseSingleEntity component
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
    setup: () => {

      return {
        SearchInputType,
      };
    },
  });
</script>
