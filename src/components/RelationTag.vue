<template>
  <span
    v-if="label"
    class="
      inline-block
      px-2
      py-2
      bg-background-dark
      cursor-pointer
      mr-4
      bg-opacity-50
      text-neutral-700
      font-bold
    "
    >{{ label }}</span
  >
</template>

<script lang="ts">
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'RelationTag',
    props: {
      label: {
        type: String,
        required: true,
      },
    },
    setup: () => {},
  });
</script>

<style scoped></style>
