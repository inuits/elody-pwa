<template>
  <a class="text-sm break-words underline" :href="link">{{
    label
  }}</a>
</template>

<script lang="ts" setup>
defineProps<{
  label: string;
  link: string;
}>();
</script>
