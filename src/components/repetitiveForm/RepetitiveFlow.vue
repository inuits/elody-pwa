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
          @metadata-submitted="onMetadataSubmitted"
        >
          <template
            #actions
            v-if="
              ((currentStepIndex > 0 && flowConfig?.linear) ||
                !flowConfig?.linear) &&
              activeStep?.showBackButton !== false
            "
          >
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
  type Entitytyping,
} from "@/generated-types/queries";
import {
  useRepetitiveForm,
  describeCreatedEntity,
  toDisplayValue,
} from "@/composables/useRepetitiveForm";
import useEntityPickerModal from "@/composables/useEntityPickerModal";
import useEntitySingle from "@/composables/useEntitySingle";
import { useModalActions } from "@/composables/useModalActions";
import { useConfirmModal } from "@/composables/useConfirmModal";
import { useBaseNotification } from "@/composables/useBaseNotification";
import { getEntityIdFromRoute } from "@/helpers";
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
const { getEntityUuid } = useEntitySingle();
const { getCallbackFunctions } = useModalActions();
const { confirm } = useConfirmModal();
const { displayErrorNotification } = useBaseNotification();
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
  activeStep.value
    ? // a step with no pickerQuery has nothing to search → create-only
      store.shouldSkipSearch(activeStep.value) || !activeStep.value.pickerQuery
    : false,
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
  // linear flows skip the overview and run a single pass straight from step 1;
  // other flows open on the overview so staged branches are visible
  view.value = store.isLinear() ? "step" : "overview";
};

const advance = async (completeCurrentStep: () => void = store.completeStep) => {
  const wasLast = store.isLastStep();
  if (wasLast && store.isLinear()) {
    const hostTerminal = flowConfig.value?.finalizeOnHost;
    if (hostTerminal) {
      const routeId = router.currentRoute.value.params.id;
      const hostId = (Array.isArray(routeId) ? routeId[0] : routeId) as
        | string
        | undefined;
      const target = await store.finalizeOnHost(hostId);
      if (target) emit("finished", { id: target.id });
      return;
    }
    const target = store.routeTarget();
    if (target) emit("finished", { id: target.id, type: target.type });
    return;
  }
  completeCurrentStep();
  if (wasLast) view.value = "overview";
};

const onSelected = async (entity: { id: string; label?: string }) => {
  store.pickExisting(entity);
  // persist the link to the prior step before advancing (link-on-select)
  const step = activeStep.value;
  if (step) await store.linkOnSelect(step);
  await advance();
};

const onCreated = async (
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
  await advance();
};

const onMetadataSubmitted = async (values: Record<string, unknown>) => {
  // metadataOnly steps have no entity of their own: their relations link the
  // flow's host entity (the page the flow was launched from) to an earlier
  // step's staged entity. Nothing is persisted here — it's staged and only
  // committed as a batch when the user clicks Afronden (see onFinish), so
  // the overview's remove button can still meaningfully cancel it.
  const step = activeStep.value;
  if (step) {
    store.stagePendingHostRelation(step, values);
  }
  if (step) {
    // no real entity to stage, but record the submitted values so the
    // overview can display them instead of an empty "—" for this step
    store.recordEntity({
      key: step.key,
      id: "",
      type: step.entityType as Entitytyping,
      isNew: false,
      details: Object.entries(values)
        .map(([key, value]) => ({
          label: `metadata.labels.${key}`,
          value: toDisplayValue(value),
        }))
        .filter((detail) => detail.value),
    });
  }
  advance(store.completeMetadataOnlyStep);
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

const isCommitting = ref(false);

const onFinish = async () => {
  if (isCommitting.value) return;
  // matches the resolution useBulkOperationsActionsBar's getCurrentEntityId
  // uses: the SingleEntity page's resolved uuid, falling back to the route
  // param (which isn't always populated depending on how the page loaded).
  const hostEntityId = getEntityUuid() || getEntityIdFromRoute();
  isCommitting.value = true;
  try {
    await store.commitPendingHostRelations(hostEntityId ?? "");
  } catch {
    // keep the overview open so staged branches aren't lost — the user can
    // retry Afronden without redoing the whole flow
    displayErrorNotification(
      "repetitiveForm.finish-failed-title",
      "repetitiveForm.finish-failed-description",
    );
    isCommitting.value = false;
    return;
  }
  isCommitting.value = false;
  // matches EntityPickerComponent.vue's submit handler: refresh whatever
  // list (e.g. the host page's related-entities library) launched this
  // bulk operation, since it won't otherwise know a relation was added.
  for (const callback of getCallbackFunctions() ?? []) {
    if (callback) await callback();
  }
  if (!flowConfig.value?.finalize) {
    emit("close");
    return;
  }
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

// Clear the module-scoped store and this component's view state so a closed
// flow restarts clean next time (linear flows never push a branch, so their
// currentBranch would otherwise linger and trip the close-confirm on reopen).
const reset = () => {
  store.resetFlow();
  selectedFinalizeType.value = null;
  view.value = "overview";
};

watch(
  () => props.open,
  (isOpen) => (isOpen ? start() : reset()),
  { immediate: true },
);
</script>
