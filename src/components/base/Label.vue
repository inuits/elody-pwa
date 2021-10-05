<template>
  <div :class="[`text-neutral-0 rounded block h-2 px-6 py-1 bg-${color} h-full text-center align-middle`]">{{name}}</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: "Label",
  props: {
    name: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      default: "neutral-700",
      required: false,
    },
  },
  setup() {
    return {};
  },
});
</script>
