<template>
  <div
    data-cy="filters-list-item-panel"
    class="flex flex-col gap-4 p-6 bg-neutral-light"
  >
    <div class="flex w-full justify-start gap-4">
      <BaseDropdownNew
        data-cy="filter-matcher-dropdown"
        class="max-h-9"
        :model-value="selectedMatcher"
        :options="matchers"
        label-position="inline"
        :default-label="defaultLabel"
        dropdown-style="default"
        @update:model-value="$emit('update:selected-matcher', $event)"
      />
      <div class="flex-grow"></div>
      <BaseButtonNew
        class="!w-9 h-9"
        label=""
        :icon="DamsIcons.Cross"
        :icon-height="22"
        :disabled="!selectedMatcher"
        button-style="accentNormal"
        button-size="small"
        @click="$emit('reset')"
      />
    </div>
    <slot v-if="selectedMatcher" />
  </div>
</template>

<script lang="ts" setup>
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import BaseDropdownNew from "@/components/base/BaseDropdownNew.vue";
import type { DropdownOption } from "@/generated-types/queries";
import { DamsIcons } from "@/generated-types/queries";

defineProps({
  matchers: {
    type: Array as () => DropdownOption[],
    required: true,
  },
  selectedMatcher: {
    type: Object as () => DropdownOption,
    default: undefined,
  },
  defaultLabel: {
    type: String,
    required: true,
  },
});

defineEmits(["update:selected-matcher", "reset"]);
</script>
