<template>
  <p class="text-xs text-text-body pt-1">
    {{ t("bulk-operations.field-partial-scope", [matched, total]) }}
  </p>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n";

defineProps<{
  matched: number;
  total: number;
}>();

const { t } = useI18n();
</script>
