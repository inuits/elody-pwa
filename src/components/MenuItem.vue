<template>
  <router-link :to="`${destination}`">
  
  <span  class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer font-bold">
    {{ labelname }}
  </span>
</router-link>
</template>

<script lang="ts" setup>
  const props = defineProps(
    { 
      labelname: String,
      destination:String

    }
    );
</script>

<style lang="postcss" scoped>

</style>
