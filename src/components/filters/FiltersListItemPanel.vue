<template>
  <div
    data-cy="filters-list-item-panel"
    class="flex flex-col gap-4 p-6 bg-neutral-light"
  >
    <div class="flex w-full justify-start gap-4">
      <AdvancedDropdown
        data-cy="filter-matcher-dropdown"
        class="max-h-9"
        :model-value="selectedMatcher"
        :options="matchers"
        :label="defaultLabel"
        :clearable="false"
        :show-menu-header="false"
        label-position="inline"
        @update:model-value="$emit('update:selected-matcher', $event)"
      />
      <div class="grow"></div>
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
import type { DropdownOption } from "@/generated-types/queries";
import { DamsIcons } from "@/generated-types/queries";
import AdvancedDropdown from "@/components/base/AdvancedDropdown.vue";

defineProps({
  matchers: {
    type: Array as () => DropdownOption[],
    required: true,
  },
  selectedMatcher: {
    type: String,
    default: undefined,
  },
  defaultLabel: {
    type: String,
    required: true,
  },
});

defineEmits(["update:selected-matcher", "reset"]);
</script>
