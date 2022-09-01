<template>
  <Library 
    :hasSimpleSearch="true" 
    :SearchInputTypeOnDrawer="SearchInputType.AdvancedInputType" 
    :SearchInputType="SearchInputType.SimpleInputtype"
    :listItemRouteName="'SingleEntity'"
    :searchPlaceholder="'Search Asset Library...'"
    :advancedFiltersChoice="'entityFilters'"
  />
</template>

<script lang="ts">
  import Library from '@/components/base/Library.vue';
  import { defineComponent } from 'vue';
  import { SearchInputType } from '@/queries';

  export default defineComponent({
    name: 'AssetLibrary',
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