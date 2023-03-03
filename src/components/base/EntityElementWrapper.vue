<template>
  <div class="w-3/4">
    <div class="bg-accent-light rounded-t-lg">
      <span class="subtitle">{{ label }}</span>
      <slot name="actions"></slot>
    </div>

    <slot name="content"></slot>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  label: string;
}>();
</script>
