<template>
  <ul class="bg-neutral-20 rounded-sm">
    <slot></slot>
  </ul>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "ListContainer",
  setup: () => {},
});
</script>
