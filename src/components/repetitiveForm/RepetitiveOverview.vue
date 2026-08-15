<template>
  <div data-testid="repetitive-overview">
    <p
      v-if="branches.length === 0"
      data-testid="repetitive-overview-empty"
      class="text-text-light py-4"
    >
      {{ $t("repetitiveForm.no-entities-yet") }}
    </p>

    <ul v-else data-testid="repetitive-overview-list" class="flex flex-col">
      <!-- rows follow the base library list-item styling -->
      <li
        v-for="(branch, index) in branches"
        :key="index"
        data-testid="repetitive-overview-row"
        class="flex items-center gap-2 p-1.5 mb-2 border border-accent-highlight rounded bg-background-light"
      >
        <span
          class="flex items-center justify-center w-8 h-8 rounded-full bg-accent-light text-accent-accent font-bold shrink-0"
        >
          {{ index + 1 }}
        </span>
        <div
          v-for="step in steps"
          :key="step.key"
          class="flex flex-col min-w-0 flex-1 px-2"
        >
          <span class="text-base font-semibold text-text-light">
            {{ $t(step.label ?? step.key) }}
          </span>
          <span class="font-medium truncate max-w-[400px]">
            {{ entityLabel(branch, step.key) }}
          </span>
          <span
            v-for="entry in overviewEntries(branch, step)"
            :key="entry.label"
            class="text-text-light text-sm truncate"
          >
            {{ $t(entry.label) }}: {{ entry.value }}
          </span>
        </div>
        <div class="w-fit ml-auto shrink-0">
          <BaseButton
            data-testid="repetitive-overview-remove"
            :icon="DamsIcons.Trash"
            button-style="danger"
            button-size="sm"
            @click="emit('remove', index)"
          />
        </div>
      </li>
    </ul>

    <div class="flex gap-3 mt-6">
      <div v-if="repeatable || branches.length === 0" class="w-fit">
        <BaseButton
          data-testid="repetitive-overview-add"
          :label="$t('repetitiveForm.add-another')"
          :icon="DamsIcons.Plus"
          button-style="commit"
          button-size="sm"
          @click="emit('add-another')"
        />
      </div>
      <div class="w-fit">
        <BaseButton
          data-testid="repetitive-overview-finish"
          :label="$t('repetitiveForm.finish')"
          :icon="DamsIcons.Check"
          button-style="commit"
          button-size="sm"
          :disabled="branches.length === 0"
          :loading="finishing"
          @click="emit('finish')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DamsIcons, type RepetitiveStep } from "@/generated-types/queries";
import BaseButton from "@/components/base/BaseButton.vue";
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
  finishing?: boolean;
}>();
const emit = defineEmits<{
  (e: "add-another"): void;
  (e: "finish"): void;
  (e: "remove", index: number): void;
}>();

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
