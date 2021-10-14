<template>
  <ul class="bg-neutral-20 p-1 border border-neutral-30 rounded-sm">
    <slot></slot>
  </ul>
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'ListContainer',
    setup: () => {},
  });
</script>
