<template>
  <div
    data-cy="filters-list-item-panel"
    class="flex flex-col gap-1.5 px-3 py-2 border-b border-border-faint"
  >
    <!-- Catalogue TextFilter: the mode is a prefix inside the input box
         ("contains ▾ | value"); a single-matcher filter has no mode. Lists,
         two fields or a slider stack under the mode instead. One element
         tree for both forms: switching only changes classes, so the
         matcher is never remounted (it would refetch its options). -->
    <!-- Grid: inline = [input box | ×]; stacked = [mode | ×] over the
         matcher spanning both columns (the box wrapper becomes contents). -->
    <div
      class="grid grid-cols-[1fr_auto] gap-1.5"
      :class="inlineMode ? 'items-stretch' : 'items-start'"
    >
      <div
        :data-cy="inlineMode ? 'filter-input-box' : undefined"
        :class="
          inlineMode
            ? 'flex min-w-0 items-stretch border border-border-default rounded-input bg-surface overflow-hidden [&_input:not([type=checkbox])]:!border-0 [&_input:not([type=checkbox])]:!bg-transparent [&_input:not([type=checkbox])]:!shadow-none [&_input:not([type=checkbox])]:!text-table [&_input:not([type=checkbox])]:!rounded-none [&_input:not([type=checkbox])]:!outline-none has-[input:focus-visible]:outline-solid has-[input:focus-visible]:outline-(length:--focus-ring-width) has-[input:focus-visible]:outline-(color:--color-focus-ring) has-[input:focus-visible]:outline-offset-(length:--focus-ring-offset)'
            : 'contents'
        "
      >
        <AdvancedDropdown
          v-if="hasModes"
          data-cy="filter-matcher-dropdown"
          :class="
            inlineMode
              ? 'shrink-0 !min-w-0 max-w-[60%] border-r border-border-subtle bg-surface-muted [--vs-font-size:var(--text-hint)] [--vs-text-color:var(--color-text-body)] [--vs-padding:var(--chip-padding)] [--vs-indicator-icon-size:var(--menu-icon-size)] [&_.vue-select]:!bg-transparent [&_.vue-select]:!rounded-none [&_.control]:!bg-transparent [&_.control]:!rounded-none [&_.vue-select]:!text-hint [&_.selectedOption]:!text-text-body [&_.selectedOption]:truncate [&_.selectedOption]:block [&_.indicators-container]:!pl-0'
              : 'col-start-1 row-start-1 self-start justify-self-start max-h-9'
          "
          :model-value="selectedMatcher"
          :options="matchers"
          :label="defaultLabel"
          :clearable="false"
          label-position="inline"
          @update:model-value="$emit('update:selected-matcher', $event)"
        />
        <div
          class="min-w-0"
          :class="inlineMode ? 'flex-1' : 'col-span-2 row-start-2'"
        >
          <slot v-if="selectedMatcher" />
        </div>
      </div>
      <BaseButtonNew
        class="shrink-0 col-start-2 row-start-1"
        :class="inlineMode ? '!w-auto !h-auto aspect-square' : '!w-8 h-8'"
        label=""
        :icon="DamsIcons.Cross"
        :aria-label="t('filters.clear-filter')"
        :icon-height="16"
        :disabled="!selectedMatcher"
        button-style="commit"
        button-size="sm"
        @click="$emit('reset')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import type { DropdownOption } from "@/generated-types/queries";
import { DamsIcons } from "@/generated-types/queries";
import AdvancedDropdown from "@/components/base/AdvancedDropdown.vue";
import { useI18n } from "vue-i18n";
import { computed } from "vue";

const { t } = useI18n();

const props = defineProps({
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
  // The matcher rendered a list (checkboxes): it needs the full width.
  stacked: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["update:selected-matcher", "reset"]);

// Two fields (min/max) or a slider don't fit one input box: mode stacks.
const STACKED_MATCHERS = ["InBetweenMatcher", "RangeMatcher"];
const inlineMode = computed(
  () =>
    !props.stacked && !STACKED_MATCHERS.includes(props.selectedMatcher ?? ""),
);
const hasModes = computed(() => props.matchers.length > 1);
</script>
