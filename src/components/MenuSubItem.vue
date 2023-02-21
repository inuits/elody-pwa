<template>

    <router-link
      v-if="show === true" 
      to="asset"
      activeClass="IsActive"
      class="dropdownMenu-item"
    >
      <span
        class="w-0 h-0 overflow-hidden px-4 cursor-pointer font-bold"
        >{{ $t("navigation.asset") }}</span
      >
    </router-link>

    <router-link
    v-if="show === true"
      activeClass="IsActive"
      to="boeken"
      class="dropdownMenu-item"
    >
      <span
        class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer font-bold"
        >{{ $t("navigation.boeken") }}</span
      >
    </router-link>
    <router-link
    v-if="show == true" 
    to="tijdschriften"
      activeClass="IsActive"
      class="dropdownMenu-item"
    >
      <router-link
        to="tijdschriften"
        class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer font-bold"
        activeClass="IsActive"       >{{ $t("navigation.tijdschriften") }}</router-link
      >
    </router-link>
</template>
<script lang="ts" setup>
import { defineComponent, ref } from "vue";
const props = defineProps({ show: Boolean });
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