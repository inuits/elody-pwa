<template>
  <div data-testid="repetitive-overview">
    <p
      v-if="branches.length === 0"
      data-testid="repetitive-overview-empty"
      class="text-text-light text-table py-2"
    >
      {{ $t("repetitiveForm.rail-empty") }}
    </p>

    <!-- guided-flow.md: the created-so-far rail, newest on top, additions announced -->
    <ul
      v-else
      data-testid="repetitive-overview-list"
      role="log"
      aria-live="polite"
      class="flex flex-col gap-2"
    >
      <li
        v-for="index in newestFirst"
        :key="index"
        data-testid="repetitive-overview-row"
        class="flex items-start gap-2 p-2 border border-border-subtle rounded-card bg-background-light text-table"
      >
        <unicon
          data-testid="repetitive-overview-saved"
          :name="Unicons.CheckCircle.name"
          height="16"
          class="shrink-0 mt-0.5 fill-success"
          aria-hidden="true"
        />
        <div class="flex flex-col min-w-0 flex-1 gap-1">
          <div
            v-for="step in steps"
            :key="step.key"
            class="flex flex-col min-w-0"
          >
            <span class="text-text-light">
              {{ $t(step.label ?? step.key) }}
            </span>
            <span class="font-bold truncate">
              {{ entityLabel(branches[index], step.key) }}
            </span>
            <span
              v-for="entry in overviewEntries(branches[index], step)"
              :key="entry.label"
              class="text-text-light truncate"
            >
              {{ $t(entry.label) }}: {{ entry.value }}
            </span>
          </div>
        </div>
        <div class="w-fit shrink-0">
          <BaseButtonNew
            data-testid="repetitive-overview-remove"
            :icon="DamsIcons.Trash"
            :aria-label="
              $t('actions.labels.remove-item', {
                item:
                  entityLabel(branches[index], steps[0]?.key) || index + 1,
              })
            "
            button-style="ghost"
            button-size="sm"
            @click="emit('remove', index)"
          />
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { DamsIcons, type RepetitiveStep } from "@/generated-types/queries";
import { Unicons } from "@/types";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import {
  primaryEntity,
  toDisplayValue,
  type RepetitiveBranch,
  type StagedEntityDetail,
} from "@/composables/useRepetitiveForm";

const props = defineProps<{
  branches: RepetitiveBranch[];
  steps: RepetitiveStep[];
  repeatable: boolean;
}>();
const emit = defineEmits<{
  (e: "remove", index: number): void;
}>();

// branch indexes, newest first; remove still emits the branch's own index
const newestFirst = computed(() =>
  props.branches.map((_, index) => index).reverse(),
);

const entityLabel = (branch: RepetitiveBranch, stepKey: string): string => {
  const entity = primaryEntity(branch, stepKey);
  if (!entity) return "";
  return entity.label || entity.id;
};

// When a step configures overviewFields, the overview shows those exact entity
// values (with translated labels); otherwise it falls back to the details
// derived from the picked/created entity. Empty values and the field that
// duplicates the row's main label are skipped so the row stays compact.
const overviewEntries = (
  branch: RepetitiveBranch,
  step: RepetitiveStep,
): StagedEntityDetail[] => {
  const entity = primaryEntity(branch, step.key);
  if (!entity) return [];
  if (step.overviewFields?.length) {
    const label = entityLabel(branch, step.key);
    return step.overviewFields
      .map((field) => ({
        label: field.label,
        value: toDisplayValue(entity.values?.[field.key]),
      }))
      .filter((entry) => entry.value && entry.value !== label);
  }
  return entity.details ?? [];
};
</script>
