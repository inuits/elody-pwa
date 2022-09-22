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

  export default defineComponent({
    name: 'MediaFileLibrary',
    components: {
      Library
    },
    emits: ['addSelection'],
    props: {
      enableSelection: {
        type: Boolean,
        default: false,
      },
    },
    setup: (props, { emit }) => {

      const addSelection = (entity: any) => {
        emit('addSelection', entity);
      };

      return {
        SearchInputType,
        addSelection
      };
    },
  });
</script>
