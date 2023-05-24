<template>
  <router-link
    v-if="show === true"
    :to="`${props.destination}`"
    class="flex flex-column items-center cursor-pointer ml-9 mt-1 origin-top-center"
  >
    <router-link
      :to="`${destination}`"
      class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer"
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
  typeLink: String,
  labelName: String,
  destination: String,
});
</script>
<style></style>
