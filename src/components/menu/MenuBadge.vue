<template>
  <span
    v-if="count > 0"
    data-cy="menu-badge"
    class="inline-flex shrink-0 items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-accent-accent text-white text-xs font-bold leading-none"
  >
    {{ count > 99 ? "99+" : count }}
  </span>
</template>

<script lang="ts" setup>
defineProps<{ count: number }>();
</script>
