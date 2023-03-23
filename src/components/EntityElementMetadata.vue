<template>
  <div class="text-sm pl-4">
    <p class="text-text-light w-full">{{ label }}</p>
    <p class="w-full">{{ value || "-" }}</p>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  label: String;
  value: String;
}>();
</script>
