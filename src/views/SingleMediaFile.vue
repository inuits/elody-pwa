<template>
<<<<<<< HEAD
  <BaseSingleEntity :isSelectionDisplayed="false" :isMetaDisplayed="false" :isMediaFileSingle="true" :entityType="'MediaFile'" />
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import BaseSingleEntity from '@/components/base/BaseSingleEntity.vue';
=======
  <BaseSingleEntity />
</template>

<script lang="ts">
  import BaseSingleEntity from '@/components/base/BaseSingleEntity.vue';
  import { defineComponent } from 'vue';
>>>>>>> WIP Ref: #97062, fix base library props and made BaseSingleEntity component

  export default defineComponent({
    name: 'SingleMediaFile',
    components: {
      BaseSingleEntity
    },
<<<<<<< HEAD
    setup() {
      
      return {
=======
    setup: () => {

      return {

>>>>>>> WIP Ref: #97062, fix base library props and made BaseSingleEntity component
      };
    },
  });
</script>
