<template>
  <div class="text-sm break-words">
    {{ label }}
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  label: string;
}>();
</script>
