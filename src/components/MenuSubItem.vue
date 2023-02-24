<template>
  <router-link
    v-if="show === true"
    :to="`${destination}`"
    activeClass="IsActive"
    class="dropdownMenu-item"
  >
    <router-link
      :to="`${destination}`"
      class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer font-bold"
      activeClass="IsActive"
    >
      {{ labelName }}</router-link
    >
  </router-link>
</template>
<script lang="ts" setup>
const props = defineProps({
  show: {
    type:Boolean,
    default:false
  },
  linkType: String,
  labelName: String,
  destination: String,
});
</script>
<style scoped>

</style>