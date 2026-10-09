<template>
  <span
    data-cy="metadata-checkbox-value"
    class="flex items-center gap-1 text-value text-text-secondary"
  >
    <unicon
      :name="value ? Unicons.Check.name : Unicons.Cross.name"
      :class="value ? 'text-success' : 'text-text-secondary'"
      height="14"
    />
    {{ value ? t("metadata.labels.yes") : t("metadata.labels.no") }}
  </span>
</template>

<script lang="ts" setup>
// A checkbox value: Ja/Nee with an icon, at the value size and colour like
// any other value (docs/design-system/components/field-row.md).
import { useI18n } from "vue-i18n";
import { Unicons } from "@/types";

defineProps<{ value: unknown }>();

const { t } = useI18n();
</script>
