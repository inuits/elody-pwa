<template>
  <router-link
    v-if="show === true"
    :to="`${destination}`"
    class="flex flex-column items-center cursor-pointer ml-9 mt-1 origin-top-center hover:text-accent-accent"
  >
    <p class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer">
      {{ labelName }}
    </p>
  </router-link>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  typeLink: String,
  labelName: String,
  destination: String,
});
</script>
<style></style>
