<template>
  <div class="mb-6 p-4 rounded border border-accent-normal bg-neutral-lightest">
    <div class="flex flex-wrap items-center gap-3">
      <span class="text-sm font-bold">
        {{ t("bulk-operations.relation-mode.question") }}
      </span>
      <AdvancedDropdown
        data-cy="bulk-edit-relation-mode"
        :model-value="modelValue"
        :options="options"
        :clearable="false"
        label-position="inline"
        @update:model-value="(mode) => emit('update:modelValue', mode)"
      />
    </div>
    <p class="pt-2 text-sm text-text-body">
      {{ t(`bulk-operations.relation-mode.explanation.${modelValue}`) }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import AdvancedDropdown from "@/components/base/AdvancedDropdown.vue";
import type { DropdownOption } from "@/generated-types/queries";
import { useI18n } from "vue-i18n";

// The payload type mirrors AdvancedDropdown's own emit: it hands back either the
// raw value or the whole option. Normalising it is the parent's job, so this
// component passes it through untouched.
type RelationMode = DropdownOption | number | string | string[] | undefined;

defineProps<{
  modelValue: RelationMode;
  options: DropdownOption[];
}>();

const emit = defineEmits<{
  (event: "update:modelValue", mode: RelationMode): void;
}>();

const { t } = useI18n();
</script>
