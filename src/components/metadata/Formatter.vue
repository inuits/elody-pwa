<template>
  <div>
    <a
      class="text-sm break-words underline"
      v-if="formatter === 'link'"
      target="_blank"
      :href="link"
      >{{ value }}</a
    >
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  formatter?: string;
  value?: any;
  link?: any;
}>();
</script>
