<template>
  <div v-html="cleanContent"></div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { sanitizeHtml } from "@/helpers";

const props = defineProps<{ htmlContent: string }>();

const cleanContent = computed(() => sanitizeHtml(props.htmlContent));
</script>

<style scoped></style>
