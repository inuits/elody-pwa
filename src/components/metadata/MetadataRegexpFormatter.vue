<template>
  <div class="text-sm break-words">
    {{ label }}
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  label: string;
}>();
</script>
