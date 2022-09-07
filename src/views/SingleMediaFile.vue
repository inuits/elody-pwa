<template>
  <BaseSingleEntity :isSelectionDisplayed="false" :isMetaDisplayed="false" :isMediaFileSingle="true" :entityType="'MediaFile'" />
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import BaseSingleEntity from '@/components/base/BaseSingleEntity.vue';

  export default defineComponent({
    name: 'SingleMediaFile',
    components: {
      BaseSingleEntity
    },
    setup() {
      return {
      };
    },
  });
</script>
