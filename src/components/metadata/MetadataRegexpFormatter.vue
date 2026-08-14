<template>
  <div class="text-value break-words">
    {{ label }}
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  label: string;
}>();
</script>
