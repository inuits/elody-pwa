<template>
  <div
    data-cy="filters-list-item-panel"
    class="flex flex-col gap-1.5 px-3 py-2 border-b border-border-faint bg-surface-group-form"
  >
    <!-- Catalogue TextFilter: the mode is a prefix inside the input box
         ("contains ▾ | value"); a single-matcher filter has no mode. -->
    <div v-if="inlineMode" class="flex items-start gap-1.5">
      <div
        data-cy="filter-input-box"
        class="flex flex-1 min-w-0 items-stretch border border-border-default rounded-input bg-surface overflow-hidden [&_input]:!border-0 [&_input]:!bg-transparent [&_input]:!shadow-none"
      >
        <AdvancedDropdown
          v-if="hasModes"
          data-cy="filter-matcher-dropdown"
          class="shrink-0 max-w-[50%] border-r border-border-subtle bg-surface-muted text-hint"
          :model-value="selectedMatcher"
          :options="matchers"
          :label="defaultLabel"
          :clearable="false"
          label-position="inline"
          @update:model-value="$emit('update:selected-matcher', $event)"
        />
        <div class="flex-1 min-w-0">
          <slot v-if="selectedMatcher" />
        </div>
      </div>
      <BaseButtonNew
        class="!w-8 h-8 shrink-0"
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
    <template v-else>
      <div class="flex w-full justify-start gap-1.5">
        <AdvancedDropdown
          v-if="hasModes"
          data-cy="filter-matcher-dropdown"
          class="max-h-9"
          :model-value="selectedMatcher"
          :options="matchers"
          :label="defaultLabel"
          :clearable="false"
          label-position="inline"
          @update:model-value="$emit('update:selected-matcher', $event)"
        />
        <div class="grow"></div>
        <BaseButtonNew
          class="!w-8 h-8"
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
      <slot v-if="selectedMatcher" />
    </template>
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
});

defineEmits(["update:selected-matcher", "reset"]);

// Two fields (min/max) or a slider don't fit one input box: mode stacks.
const STACKED_MATCHERS = ["InBetweenMatcher", "RangeMatcher"];
const inlineMode = computed(
  () => !STACKED_MATCHERS.includes(props.selectedMatcher ?? ""),
);
const hasModes = computed(() => props.matchers.length > 1);
</script>
