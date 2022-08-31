<template>
<<<<<<< HEAD
  <BaseSingleEntity :isSelectionDisplayed="true" :isMetaDisplayed="true" :isMediaFileSingle="false" :entityType="'Entity'" />
=======
  <BaseSingleEntity />
>>>>>>> WIP Ref: #97062, fix base library props and made BaseSingleEntity component
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
