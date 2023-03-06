<template>
  <div class="bg-accent-light rounded-t-lg">
    <div>
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
