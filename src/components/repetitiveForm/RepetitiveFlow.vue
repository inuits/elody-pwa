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

      <RepetitiveOverview
        v-else-if="view === 'overview'"
        :branches="branches"
        :steps="flowConfig?.steps ?? []"
        @add-another="addAnother"
        @finish="onFinish"
      />

      <DynamicForm
        v-else-if="view === 'finalize'"
        :dynamic-form-query="finalizeForm"
        :router="router"
        :prefilled-form-values="finalizePrefill"
        @entity-created="onFinalized"
      />
    </div>
  </RepetitiveStepModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import type { AdvancedFilterInput } from "@/generated-types/queries";
import {
  useRepetitiveForm,
  type RepetitiveFormConfig,
} from "@/composables/useRepetitiveForm";
import useEntityPickerModal from "@/composables/useEntityPickerModal";
import RepetitiveStepModal from "@/components/repetitiveForm/RepetitiveStepModal.vue";
import RepetitiveStepField from "@/components/repetitiveForm/RepetitiveStepField.vue";
import RepetitiveOverview from "@/components/repetitiveForm/RepetitiveOverview.vue";
import DynamicForm from "@/components/dynamicForms/DynamicForm.vue";

const FLOW_ID = "repetitive-flow";

const props = defineProps<{ open: boolean; config: RepetitiveFormConfig }>();
const emit = defineEmits<{
  (e: "close"): void;
  (e: "finished", entity: { id?: string; uuid?: string }): void;
}>();

const store = useRepetitiveForm();
const { flowConfig, currentStepIndex, currentBranch, branches } = store;
const { setEntityId, setDynamicFormId } = useEntityPickerModal();
const router = useRouter();

const view = ref<"step" | "overview" | "finalize">("step");

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

const finalizeForm = computed(() => flowConfig.value?.finalize?.createForm ?? "");
const finalizePrefill = computed(() => store.buildFinalizePrefill());

const start = () => {
  store.initFlow(props.config);
  setEntityId(FLOW_ID);
  setDynamicFormId(FLOW_ID);
  view.value = "step";
};

const advance = () => {
  const wasLast = store.isLastStep();
  store.completeStep();
  if (wasLast) view.value = "overview";
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

const onFinish = () => {
  view.value = "finalize";
};

const onFinalized = (entity: { id?: string; uuid?: string }) => {
  emit("finished", entity);
};

watch(() => props.open, (isOpen) => { if (isOpen) start(); }, { immediate: true });
</script>
