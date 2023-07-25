<template>
  <router-link
    v-if="show === true"
    :to="`${destination}`"
    :class="[
      'flex flex-column items-center cursor-pointer ml-9 mt-1 origin-top-center hover:text-accent-accent',
      { 'text-accent-accent': isActive },
    ]"
  >
    <p class="nav-item-label w-0 h-0 overflow-hidden px-4 cursor-pointer">
      {{ labelName }}
    </p>
  </router-link>
</template>

<script lang="ts" setup>
import { computed, defineProps } from "vue";
import { useRoute } from "vue-router";
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  typeLink: String,
  labelName: String,
  destination: String,
});
const route = useRoute();
const isActive = computed(
  () => route.path.replace("/", "") === props.destination
);
</script>
<style></style>
