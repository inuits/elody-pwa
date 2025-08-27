<template>
  <div
    v-if="mode === SanitizeMode.Html"
    data-cy="sanitized-value"
    v-html="cleanContent"
  ></div>
  <a
    v-else-if="mode === SanitizeMode.Link"
    data-cy="sanitized-value"
    :href="cleanContent"
    >{{ linkText }}</a
  >
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { sanitizeHtml } from "@/helpers";
import { SanitizeMode } from "@/generated-types/queries";
import { useI18n } from "vue-i18n";

const props = withDefaults(
  defineProps<{
    mode?: SanitizeMode;
    content: string;
    linkText?: string;
    linkTextIsTranslationKey?: boolean;
  }>(),
  {
    mode: SanitizeMode.Link,
    content: "",
    linkText: "",
  },
);

const { t } = useI18n();

const cleanContent = computed<string>(() => sanitizeHtml(props.content));
</script>

<style scoped></style>
