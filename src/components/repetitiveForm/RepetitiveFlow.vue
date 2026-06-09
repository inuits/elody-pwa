<template>
  <RepetitiveStepModal :open="open" @close="emit('close')">
    <div data-testid="repetitive-flow">
      <ol data-testid="repetitive-flow-steps" class="flex gap-3 mb-4">
        <li
          v-for="(title, index) in stepTitles"
          :key="title"
          :class="index === currentStepIndex ? 'font-bold' : 'text-text-light'"
        >
          {{ title }}
        </li>
      </ol>

      <RepetitiveStepField
        v-if="view === 'step' && activeStep"
        :key="currentStepIndex"
        :step="activeStep"
        :scope-filter="scopeFilter"
        :skip-search="skipSearch"
        :create-prefill="createPrefill"
        :picker-parent-uuid="pickerParentUuid"
        @selected="onSelected"
        @created="onCreated"
      />

      <div v-else-if="view === 'branchDone'" data-testid="repetitive-flow-branch-done">
        <p>{{ branches.length }}</p>
        <button
          type="button"
          data-testid="repetitive-flow-add-another"
          @click="addAnother"
        >
          {{ $t("repetitiveForm.add-another") }}
        </button>
        <!-- overview list + finish: Plan 3b -->
      </div>
    </div>
  </RepetitiveStepModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import type { AdvancedFilterInput } from "@/generated-types/queries";
import {
  useRepetitiveForm,
  type RepetitiveFormConfig,
} from "@/composables/useRepetitiveForm";
import useEntityPickerModal from "@/composables/useEntityPickerModal";
import RepetitiveStepModal from "@/components/repetitiveForm/RepetitiveStepModal.vue";
import RepetitiveStepField from "@/components/repetitiveForm/RepetitiveStepField.vue";

const FLOW_ID = "repetitive-flow";

const props = defineProps<{ open: boolean; config: RepetitiveFormConfig }>();
const emit = defineEmits<{ (e: "close"): void }>();

const store = useRepetitiveForm();
const { flowConfig, currentStepIndex, currentBranch, branches } = store;
const { setEntityId, setDynamicFormId } = useEntityPickerModal();

const view = ref<"step" | "branchDone">("step");

const activeStep = computed(() => store.activeStep());
const stepTitles = computed(() => flowConfig.value?.steps.map((s) => s.key) ?? []);

const scopeFilter = computed<AdvancedFilterInput | null>(() =>
  activeStep.value ? store.buildScopeFilter(activeStep.value) : null,
);
const skipSearch = computed(() =>
  activeStep.value ? store.shouldSkipSearch(activeStep.value) : false,
);
const createPrefill = computed(() =>
  activeStep.value ? store.buildCreatePrefill(activeStep.value) : undefined,
);
const pickerParentUuid = computed(() => {
  const scopeStep = activeStep.value?.scopeToRelationOf?.step;
  return (scopeStep && currentBranch.value.entities[scopeStep]?.id) || "";
});

const start = () => {
  store.initFlow(props.config);
  setEntityId(FLOW_ID);
  setDynamicFormId(FLOW_ID);
  view.value = "step";
};

const advance = () => {
  const wasLast = store.isLastStep();
  store.completeStep();
  if (wasLast) view.value = "branchDone";
};

const onSelected = (entity: { id: string; label?: string }) => {
  store.pickExisting(entity);
  advance();
};

const onCreated = (entity: { id?: string; uuid?: string; label?: string }) => {
  store.recordCreated(entity);
  advance();
};

const addAnother = () => {
  store.startNewBranch();
  view.value = "step";
};

watch(() => props.open, (isOpen) => { if (isOpen) start(); }, { immediate: true });
</script>
