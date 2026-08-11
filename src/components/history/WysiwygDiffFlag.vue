<template>
  <div class="flex items-center gap-2">
    <span class="font-medium">{{ label }}:</span>
    <span
      :class="[
        'rounded-full px-2 py-1 text-sm',
        changed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
      ]"
    >
      {{ changed ? "Changed" : "Unchanged" }}
    </span>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  label: string;
  changed: boolean;
}>();
</script>
