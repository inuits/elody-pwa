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
          <span class="text-sm text-text-light">
            {{ $t(step.label ?? step.key) }}
          </span>
          <span class="font-medium truncate">
            {{ entityLabel(branch, step.key) || "—" }}
          </span>
          <span
            v-for="detail in entityDetails(branch, step.key)"
            :key="detail.label"
            class="text-sm text-text-light truncate"
          >
            {{ $t(detail.label) }}: {{ detail.value }}
          </span>
        </div>
        <div class="w-fit ml-auto shrink-0">
          <BaseButtonNew
            data-testid="repetitive-overview-remove"
            :icon="DamsIcons.Trash"
            button-style="redDefault"
            button-size="small"
            @click="emit('remove', index)"
          />
        </div>
      </li>
    </ul>

    <div class="flex gap-3 mt-6">
      <div v-if="repeatable || branches.length === 0" class="w-fit">
        <BaseButtonNew
          data-testid="repetitive-overview-add"
          :label="$t('repetitiveForm.add-another')"
          :icon="DamsIcons.Plus"
          button-style="accentAccent"
          button-size="small"
          @click="emit('add-another')"
        />
      </div>
      <div class="w-fit">
        <BaseButtonNew
          data-testid="repetitive-overview-finish"
          :label="$t('repetitiveForm.finish')"
          :icon="DamsIcons.Check"
          button-style="accentAccent"
          button-size="small"
          :disabled="branches.length === 0"
          @click="emit('finish')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DamsIcons } from "@/generated-types/queries";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import type {
  RepetitiveBranch,
  RepetitiveStepConfig,
  StagedEntityDetail,
} from "@/composables/useRepetitiveForm";

const props = defineProps<{
  branches: RepetitiveBranch[];
  steps: RepetitiveStepConfig[];
  repeatable: boolean;
}>();
const emit = defineEmits<{
  (e: "add-another"): void;
  (e: "finish"): void;
  (e: "remove", index: number): void;
}>();

const entityLabel = (branch: RepetitiveBranch, stepKey: string): string => {
  const entity = branch.entities[stepKey];
  if (!entity) return "";
  return entity.label || entity.id;
};

const entityDetails = (
  branch: RepetitiveBranch,
  stepKey: string,
): StagedEntityDetail[] => branch.entities[stepKey]?.details ?? [];
</script>
