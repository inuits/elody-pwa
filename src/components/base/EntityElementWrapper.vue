<template>
  <div class="">
    <div class="bg-accent-light">
      <span class="text-text-body">{{ label }}</span>
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
