<template>
  <AssetLibrary />
</template>

<script lang="ts">
  import { defineComponent } from 'vue';
  import AssetLibrary from '@/components/AssetLibrary.vue';

  export default defineComponent({
    name: 'Home',
    components: { AssetLibrary },
  });
</script>
