<template>
  <router-link
    v-if="show === true"
    :to="`${destination}`"
    class="flex flex-column items-center cursor-pointer ml-9 mt-2 origin-top-center"
  >
    <router-link
      :to="`${destination}`"
      class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer font-bold"
    >
      {{ labelName }}</router-link
    >
  </router-link>
</template>
<script lang="ts" setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  linkType: String,
  labelName: String,
  destination: String,
});
</script>
<style>

</style>
