<template>
  <router-link
    v-if="show === true"
    :to="`${destination}`"
    class="flex flex-column items-center dropdownMenu-item"
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
.dropdownMenu-item {
  cursor: pointer;
  margin-left: 2.7rem;
  margin-top: 0.3rem;
  animation: dropdown 300ms ease-in-out forwards;
  transform-origin: top center;
}

@keyframes dropdown {
0% {
    transform: translateY(0)
}
80% {
    transform: translateY(1)
}
100% {
    transform: translateY(1)
}
}
</style>
