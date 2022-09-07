<template>
  <Library 
    :has-simple-search="true" 
    :search-input-type-on-drawer="SearchInputType.AdvancedInputType" 
    :search-input-type="SearchInputType.SimpleInputtype"
    :list-item-route-name="'SingleEntity'"
    :search-placeholder="'Search Asset Library...'"
    :advanced-filters-choice="'entityFilters'"
    @add-selection="addSelection"
    :enable-selection="enableSelection"
    :accepted-entity-types="acceptedEntityTypes"
  />
</template>

<script lang="ts">
  import Library from '@/components/base/Library.vue';
  import { defineComponent, PropType } from 'vue';
  import { SearchInputType } from '@/queries';

  export default defineComponent({
    name: 'AssetLibrary',
    props: {
      enableSelection: {
        type: Boolean,
        default: false,
      },
      acceptedEntityTypes: {
        type: Array as PropType<string[]>,
        default: () => [],
        required: false,
      },
    },
    components: {
      Library
    },
    setup: (props, { emit }) => {

      const addSelection = (id: string) => {
        emit('addSelection', id);
      };

      return {
        SearchInputType,
        addSelection
      };
    },
  });
</script>