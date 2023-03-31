<template>
  <router-link
    v-if="this.show === true"
    :to="`${this.destination}`"
    class="flex flex-column items-center cursor-pointer ml-9 mt-1 origin-top-center"
  >
    <router-link
      :to="`${this.destination}`"
      class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer"
    >
      {{ this.labelName }}</router-link
    >
  </router-link>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";
const props = defineProps({
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
