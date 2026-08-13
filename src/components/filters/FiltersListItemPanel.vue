<template>
  <div
    data-cy="filters-list-item-panel"
    class="flex flex-col gap-1.5 px-4 pb-3 pt-1"
  >
    <!-- The search mode is a prefix in reading order ("bevat · verhulst"):
         the mode select sits BEFORE the input. Single-matcher filters show
         no operator UI at all. -->
    <div class="flex w-full items-start gap-1">
      <AdvancedDropdown
        v-if="matchers.length > 1"
        data-cy="filter-matcher-dropdown"
        class="max-h-8 w-28 shrink-0 text-xs"
        :model-value="selectedMatcher"
        :options="matchers"
        :label="defaultLabel"
        :clearable="false"
        :show-menu-header="false"
        label-position="inline"
        @update:model-value="$emit('update:selected-matcher', $event)"
      />
      <div class="min-w-0 grow">
        <slot v-if="selectedMatcher" />
      </div>
    </div>
    <button
      v-if="selectedMatcher"
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
import type { DropdownOption } from "@/generated-types/queries";
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
