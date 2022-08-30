<template>
  <Library 
    :hasSimpleSearch="false" 
    :SearchInputTypeOnDrawer="SearchInputType.AdvancedInputType" 
    :SearchInputType="SearchInputType.SimpleInputtype"
    :listItemRouteName="'SingleEntity'"
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