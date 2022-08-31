<template>
  <BaseSingleEntity />
</template>

<script lang="ts">
  import BaseSingleEntity from '@/components/base/BaseSingleEntity.vue';
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'SingleMediaFile',
    components: {
      BaseSingleEntity
    },
    setup: () => {

      return {

      };
    },
  });
</script>
