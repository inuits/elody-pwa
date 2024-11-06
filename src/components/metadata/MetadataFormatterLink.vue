<template>
  <a
    class="text-sm break-words underline line-clamp-1" :href="link"
    style="color: #1d4ed8"
  >
    {{ label }}
  </a>
</template>

<script lang="ts" setup>
defineProps<{
  label: string;
  link: string;
}>();
</script>
