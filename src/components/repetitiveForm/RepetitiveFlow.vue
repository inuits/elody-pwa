<template>
  <RepetitiveStepModal :open="open" :title="modalTitle" @close="emit('close')">
    <div data-testid="repetitive-flow">
      <ol
        v-if="view === 'step'"
        data-testid="repetitive-flow-steps"
        class="flex items-center gap-2 mb-6"
      >
        <li
          v-for="(step, index) in flowConfig?.steps ?? []"
          :key="step.key"
          class="flex items-center gap-2"
        >
          <span
            class="flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold"
            :class="
              index === currentStepIndex
                ? 'bg-accent-accent text-neutral-white'
                : index < currentStepIndex
                  ? 'bg-accent-light text-accent-accent'
                  : 'bg-background-normal text-text-light'
            "
          >
            {{ index + 1 }}
          </span>
          <span
            :class="
              index === currentStepIndex
                ? 'font-bold'
                : 'text-text-light'
            "
          >
            {{ $t(step.label ?? step.key) }}
          </span>
          <span
            v-if="index < (flowConfig?.steps.length ?? 0) - 1"
            class="text-text-light px-1"
            >›</span
          >
        </li>
      </ol>

      <RepetitiveOverview
        v-if="view === 'overview'"
        :branches="branches"
        :steps="flowConfig?.steps ?? []"
        :repeatable="flowConfig?.repeatable ?? false"
        @add-another="addAnother"
        @finish="onFinish"
        @remove="onRemoveBranch"
      />

      <template v-else-if="view === 'step' && activeStep">
        <div class="w-fit mb-4">
          <BaseButtonNew
            data-testid="repetitive-flow-back"
            :label="
              currentStepIndex > 0
                ? $t('repetitiveForm.back-to-previous-step')
                : $t('repetitiveForm.back-to-overview')
            "
            :icon="DamsIcons.AngleLeft"
            button-style="accentAccent"
            button-size="small"
            @click="goBack"
          />
        </div>
        <RepetitiveStepField
          :step="activeStep"
          :scope-filter="scopeFilter"
          :skip-search="skipSearch"
          :create-prefill="createPrefill"
          :picker-parent-uuid="pickerParentUuid"
          @selected="onSelected"
          @created="onCreated"
        />
      </template>

      <template v-else-if="view === 'finalize'">
        <div class="w-fit mb-4">
          <BaseButtonNew
            data-testid="repetitive-flow-back-to-overview"
            :label="$t('repetitiveForm.back-to-overview')"
            :icon="DamsIcons.AngleLeft"
            button-style="accentAccent"
            button-size="small"
            @click="view = 'overview'"
          />
        </div>
        <h2
          v-if="finalizeLabel"
          data-testid="repetitive-flow-finalize-heading"
          class="title pb-4"
        >
          {{ $t(finalizeLabel) }}
        </h2>
        <DynamicForm
          :dynamic-form-query="finalizeForm"
          :router="router"
          :prefilled-form-values="finalizePrefill"
          :emit-entity-created="true"
          @entity-created="onFinalized"
        />
      </template>
    </div>
  </RepetitiveStepModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { DamsIcons, type AdvancedFilterInput } from "@/generated-types/queries";
import {
  useRepetitiveForm,
  describeCreatedEntity,
  type RepetitiveFormConfig,
} from "@/composables/useRepetitiveForm";
import useEntityPickerModal from "@/composables/useEntityPickerModal";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import RepetitiveStepModal from "@/components/repetitiveForm/RepetitiveStepModal.vue";
import RepetitiveStepField from "@/components/repetitiveForm/RepetitiveStepField.vue";
import RepetitiveOverview from "@/components/repetitiveForm/RepetitiveOverview.vue";
import DynamicForm from "@/components/dynamicForms/DynamicForm.vue";

const FLOW_ID = "repetitive-flow";

const props = defineProps<{ open: boolean; config: RepetitiveFormConfig }>();
const emit = defineEmits<{
  (e: "close"): void;
  (e: "finished", entity: { id?: string; uuid?: string; type?: string }): void;
}>();

const store = useRepetitiveForm();
const { flowConfig, currentStepIndex, currentBranch, branches } = store;
const { setEntityId, setDynamicFormId } = useEntityPickerModal();
const router = useRouter();
const { t } = useI18n();

const view = ref<"step" | "overview" | "finalize">("overview");

const activeStep = computed(() => store.activeStep());

const modalTitle = computed(() => {
  const flowLabel = flowConfig.value?.label;
  const title = flowLabel ? t(flowLabel) : "";
  if (view.value === "step" && activeStep.value) {
    return t("repetitiveForm.step-of", {
      current: currentStepIndex.value + 1,
      total: flowConfig.value?.steps.length ?? 0,
      label: t(activeStep.value.label ?? activeStep.value.key),
    });
  }
  return title;
});

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
const finalizeLabel = computed(() => flowConfig.value?.finalize?.label ?? "");
const finalizePrefill = computed(() => store.buildFinalizePrefill());

const start = () => {
  store.initFlow(props.config);
  setEntityId(FLOW_ID);
  setDynamicFormId(FLOW_ID);
  // the flow opens on the overview so the user sees what has been staged,
  // can add a (first) branch, or finish
  view.value = "overview";
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

const onCreated = (entity: { id?: string; uuid?: string }) => {
  const { label, details } = describeCreatedEntity(entity);
  store.recordCreated({ ...entity, label, details });
  advance();
};

const addAnother = () => {
  store.startNewBranch();
  view.value = "step";
};

const onRemoveBranch = (index: number) => {
  store.removeBranch(index);
};

const goBack = () => {
  if (currentStepIndex.value > 0) {
    store.goToPreviousStep();
    return;
  }
  // leaving from the first step abandons the branch in progress
  store.startNewBranch();
  view.value = "overview";
};

const onFinish = () => {
  view.value = "finalize";
};

const onFinalized = (entity: { id?: string; uuid?: string; type?: string }) => {
  emit("finished", entity);
};

watch(() => props.open, (isOpen) => { if (isOpen) start(); }, { immediate: true });
</script>
