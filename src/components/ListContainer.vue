<template>
  <ul class="px-0 py-1">
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
