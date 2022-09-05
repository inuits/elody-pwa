<template>
  <BaseSingleEntity :isSelectionDisplayed="true" :isMetaDisplayed="true" :isMediaFileSingle="false" :entityType="'Entity'" />
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import BaseSingleEntity from '@/components/base/BaseSingleEntity.vue';

  export default defineComponent({
    name: 'SingleEntity',
    components: {
      BaseSingleEntity
    },
    setup() {
      
      return {
      };
    },
  });
</script>
