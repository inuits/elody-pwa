<template>
  <a
    class="text-sm break-words underline line-clamp-1"
    :href="link"
    style="color: #1d4ed8"
    @click.stop
  >
    {{ label }}
  </a>
</template>

<script lang="ts" setup>
defineProps<{
  label: string;
  link: string;
}>();
</script>
