<template>
  <div
    data-cy="filters-list-item-panel"
    class="flex flex-col gap-2 px-4 py-3 bg-neutral-lightest"
  >
    <!-- No operator dropdown above every field: single-matcher filters show
         no operator UI at all; others get a compact select beside the reset. -->
    <div v-if="matchers.length > 1" class="flex w-full items-center gap-2">
      <AdvancedDropdown
        data-cy="filter-matcher-dropdown"
        class="max-h-8 grow text-sm"
        :model-value="selectedMatcher"
        :options="matchers"
        :label="defaultLabel"
        :clearable="false"
        :show-menu-header="false"
        label-position="inline"
        @update:model-value="$emit('update:selected-matcher', $event)"
      />
      <BaseButtonNew
        class="!w-8 h-8 shrink-0"
        label=""
        :icon="DamsIcons.Cross"
        :icon-height="18"
        :disabled="!selectedMatcher"
        button-style="accentNormal"
        button-size="small"
        @click="$emit('reset')"
      />
    </div>
    <slot v-if="selectedMatcher" />
    <button
      v-if="matchers.length <= 1 && selectedMatcher"
      type="button"
      data-cy="filter-single-reset"
      class="self-start rounded-md border-none bg-transparent p-0 text-xs font-bold text-neutral-200 underline decoration-dotted cursor-pointer hover:text-accent-accent focus-visible:outline-2 focus-visible:outline-accent-accent"
      @click="$emit('reset')"
    >
      {{ clearLabel }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import type { DropdownOption } from "@/generated-types/queries";
import { DamsIcons } from "@/generated-types/queries";
import AdvancedDropdown from "@/components/base/AdvancedDropdown.vue";

const { t, te } = useI18n();
const clearLabel = computed(() =>
  te("filters.matcher-labels.clear-filter")
    ? t("filters.matcher-labels.clear-filter")
    : "Clear filter",
);

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
