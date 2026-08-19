<template>
  <div
    class="shrink-0 w-8"
    :title="
      t(cleared ? 'bulk-operations.keep-field' : 'bulk-operations.clear-field')
    "
  >
    <BaseButtonNew
      :data-cy="`bulk-edit-clear-${fieldKey}`"
      :icon="cleared ? DamsIcons.ArrowCircleLeft : DamsIcons.Trash"
      :button-style="cleared ? 'accentNormal' : 'default'"
      button-size="verySmall"
      @click="() => emit('toggle')"
    />
  </div>
</template>

<script lang="ts" setup>
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { DamsIcons } from "@/generated-types/queries";
import { useI18n } from "vue-i18n";

defineProps<{
  fieldKey: string;
  cleared: boolean;
}>();

const emit = defineEmits<{
  (event: "toggle"): void;
}>();

const { t } = useI18n();
</script>
