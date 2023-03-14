<template>
  <div class="bg-accent-light rounded-t-lg">
    <div class="flex">
      <span class="subtitle p-2">{{ label }}</span>
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
