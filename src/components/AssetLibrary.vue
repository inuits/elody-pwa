<template>
  <Library 
    :hasSimpleSearch="true" 
    :SearchInputTypeOnDrawer="SearchInputType.AdvancedInputType" 
    :SearchInputType="SearchInputType.SimpleInputtype"
    :listItemRouteName="'SingleEntity'"
    :searchPlaceholder="'Search Asset Library...'"
<<<<<<< HEAD
    :advancedFiltersChoice="'entityFilters'"
=======
>>>>>>> WIP Ref: #97062, fix base library props and made BaseSingleEntity component
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