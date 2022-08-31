<template>
  <Library 
    :hasSimpleSearch="false" 
    :SearchInputTypeOnDrawer="SearchInputType.AdvancedInputMediaFilesType" 
    :SearchInputType="SearchInputType.AdvancedInputMediaFilesType"
    :listItemRouteName="'SingleMediafile'"
    :searchPlaceholder="'Search Mediafiles...'"
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
