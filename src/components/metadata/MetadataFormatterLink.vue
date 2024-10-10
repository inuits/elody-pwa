<template>
  <a class="text-sm break-words underline" target="_blank" :href="link">{{
    label
  }}</a>
</template>

<script lang="ts" setup>
const props = defineProps<{
  label: string;
  link: string;
}>();
</script>
