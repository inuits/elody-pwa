<template>
  <img
    v-if="url"
    :src="url"
    alt=""
    class="w-10 h-10 shrink-0 object-cover border border-border-subtle rounded-chip"
  />
  <span
    v-else
    class="w-10 h-10 shrink-0 bg-surface-muted border border-border-subtle rounded-chip"
  />
</template>

<script lang="ts" setup>
defineProps<{ url?: string }>();
</script>
