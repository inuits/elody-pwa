<template>
  <div data-testid="repetitive-overview">
    <ul data-testid="repetitive-overview-list">
      <li
        v-for="(branch, index) in branches"
        :key="index"
        data-testid="repetitive-overview-row"
        class="flex gap-2 py-1"
      >
        <span v-for="step in steps" :key="step.key" class="after:content-['_·']">
          {{ entityLabel(branch, step.key) }}
        </span>
      </li>
    </ul>

    <div class="flex gap-3 mt-4">
      <button
        type="button"
        data-testid="repetitive-overview-add"
        @click="emit('add-another')"
      >
        {{ $t("repetitiveForm.add-another") }}
      </button>
      <button
        type="button"
        data-testid="repetitive-overview-finish"
        :disabled="branches.length === 0"
        @click="emit('finish')"
      >
        {{ $t("repetitiveForm.finish") }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  RepetitiveBranch,
  RepetitiveStepConfig,
} from "@/composables/useRepetitiveForm";

const props = defineProps<{
  branches: RepetitiveBranch[];
  steps: RepetitiveStepConfig[];
}>();
const emit = defineEmits<{ (e: "add-another"): void; (e: "finish"): void }>();

const entityLabel = (branch: RepetitiveBranch, stepKey: string): string => {
  const entity = branch.entities[stepKey];
  if (!entity) return "";
  return entity.label || entity.id;
};
</script>
