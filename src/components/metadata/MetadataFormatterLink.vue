<template>
  <a class="text-sm underline" :href="link" style="color: #1d4ed8" @click.stop>
    {{ label }}
  </a>
</template>

<script lang="ts" setup>
defineProps<{
  label: string;
  link: string;
}>();
</script>
