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
    type: Boolean,
    default: true,
  },
  linkType: String,
  labelName: String,
  destination: String,
});
</script>
<style scoped>
.dropdownMenu-item {
  cursor: pointer;
  margin-left: 3.6rem;
  animation: dropdown 1s 1;
  margin-top: 0.5rem;
}
@keyframes dropdown {
  0% {
    margin-top: -1.5rem;
    transition: opacity 0 0.2s ease-in;
  }
  100% {
    margin-top: 0.5rem;
  }
}
</style>