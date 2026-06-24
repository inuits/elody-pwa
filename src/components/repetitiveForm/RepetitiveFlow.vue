<template>
  <RepetitiveStepModal :open="open" :title="modalTitle" @close="requestClose">
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
        <RepetitiveStepField
          :step="activeStep"
          :scope-filter="scopeFilter"
          :skip-search="skipSearch"
          :create-prefill="createPrefill"
          :picker-parent-uuid="pickerParentUuid"
          @selected="onSelected"
          @created="onCreated"
        >
          <template #actions>
            <div class="w-fit">
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
          </template>
        </RepetitiveStepField>
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
          v-if="selectedFinalizeType"
          :key="selectedFinalizeType.entityType"
          :dynamic-form-query="selectedFinalizeType.createForm"
          :router="router"
          :prefilled-form-values="finalizePrefill"
          :emit-entity-created="true"
          @entity-created="onFinalized"
        />
        <!-- more than one creatable manifestation type: pick which to create -->
        <RepetitiveCreateButton
          v-else
          :types="finalizeOptions"
          @select="(type) => (selectedFinalizeType = type)"
        />
      </template>
    </div>
  </RepetitiveStepModal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import {
  DamsIcons,
  type AdvancedFilterInput,
  type RepetitiveForm,
  type RepetitiveCreatableType,
} from "@/generated-types/queries";
import {
  useRepetitiveForm,
  describeCreatedEntity,
} from "@/composables/useRepetitiveForm";
import useEntityPickerModal from "@/composables/useEntityPickerModal";
import { useConfirmModal } from "@/composables/useConfirmModal";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import RepetitiveStepModal from "@/components/repetitiveForm/RepetitiveStepModal.vue";
import RepetitiveStepField from "@/components/repetitiveForm/RepetitiveStepField.vue";
import RepetitiveOverview from "@/components/repetitiveForm/RepetitiveOverview.vue";
import RepetitiveCreateButton from "@/components/repetitiveForm/RepetitiveCreateButton.vue";
import DynamicForm from "@/components/dynamicForms/DynamicForm.vue";

const FLOW_ID = "repetitive-flow";

const props = defineProps<{ open: boolean; config: RepetitiveForm }>();
const emit = defineEmits<{
  (e: "close"): void;
  (e: "finished", entity: { id?: string; uuid?: string; type?: string }): void;
}>();

const store = useRepetitiveForm();
const { flowConfig, currentStepIndex, currentBranch, branches } = store;
const { setEntityId, setDynamicFormId } = useEntityPickerModal();
const { confirm } = useConfirmModal();
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

const finalizeLabel = computed(() => flowConfig.value?.finalize?.label ?? "");
const finalizePrefill = computed(() => store.buildFinalizePrefill());

// the subtypes in the finalize screen can create, or a single
// fallback derived from the finalize createForm
const finalizeOptions = computed<RepetitiveCreatableType[]>(() => {
  const finalize = flowConfig.value?.finalize;
  if (!finalize) return [];
  return finalize.creatableTypes?.length
    ? finalize.creatableTypes
    : [
        {
          label: "repetitiveForm.create-new",
          entityType: finalize.entityType,
          createForm: finalize.createForm,
        },
      ];
});
const selectedFinalizeType = ref<RepetitiveCreatableType | null>(null);

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

const onCreated = (
  entity: {
    id?: string;
    uuid?: string;
    intialValues?: Record<string, unknown>;
  },
  entityType?: string,
) => {
  const { label, details } = describeCreatedEntity(entity);
  // the created entity's intialValues feed the overview's configured fields;
  // entityType is the concrete subtype the user picked on the create screen
  store.recordCreated({
    ...entity,
    type: entityType,
    label,
    details,
    values: entity.intialValues,
  });
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
  // preselect when there is only one creatable type; otherwise show the chooser
  selectedFinalizeType.value =
    finalizeOptions.value.length === 1 ? finalizeOptions.value[0] : null;
  view.value = "finalize";
};

const onFinalized = (entity: { id?: string; uuid?: string; type?: string }) => {
  emit("finished", entity);
};

const hasStagedProgress = (): boolean =>
  branches.value.length > 0 ||
  Object.keys(currentBranch.value.entities).length > 0;

// Closing mid-flow abandons the staging (already-created entities are kept,
// but the flow won't be finalized), so confirm first when there is progress.
const requestClose = async () => {
  if (!hasStagedProgress()) {
    emit("close");
    return;
  }
  const choice = await confirm({
    title: t("confirm.close-guided-flow.title"),
    message: t("confirm.close-guided-flow.message"),
    confirmLabel: t("confirm.close-guided-flow.confirm"),
    cancelLabel: t("confirm.close-guided-flow.cancel"),
  });
  if (choice !== "confirm") return;
  emit("close");
};

watch(() => props.open, (isOpen) => { if (isOpen) start(); }, { immediate: true });
</script>
