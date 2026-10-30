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
          :aria-current="index === currentStepIndex ? 'step' : undefined"
        >
          <!-- guided-flow.md: filled current step, check on finished ones -->
          <span
            class="flex items-center justify-center w-6 h-6 rounded-full text-table font-bold"
            :class="
              index === currentStepIndex
                ? 'bg-accent-dark text-neutral-white'
                : index < currentStepIndex
                  ? 'bg-accent-light text-accent-ink'
                  : 'bg-surface-muted text-text-light'
            "
          >
            <template v-if="index < currentStepIndex">
              <unicon
                data-testid="step-done"
                :name="Unicons.Check.name"
                height="16"
                aria-hidden="true"
              />
              <span class="sr-only">{{ $t("repetitiveForm.step-done") }}</span>
            </template>
            <template v-else>{{ index + 1 }}</template>
          </span>
          <span
            :class="
              index === currentStepIndex ? 'font-bold' : 'text-text-light'
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

      <!-- guided-flow.md: step card beside the "Created this session" rail -->
      <div
        v-if="view === 'step'"
        class="grid gap-4"
        :class="{ 'lg:grid-cols-[1fr_var(--guided-flow-rail-width)]': hasRail }"
      >
        <section
          data-testid="repetitive-flow-step-card"
          class="bg-surface-group-form rounded-card p-4 min-w-0"
        >
          <p
            v-if="isChainDone"
            data-testid="repetitive-flow-complete"
            class="text-text-body"
          >
            {{ $t("repetitiveForm.item-complete") }}
          </p>
          <RepetitiveStepField
            v-else-if="activeStep"
            :step="activeStep"
            :scope-filter="scopeFilter"
            :skip-search="skipSearch"
            :create-prefill="createPrefill"
            :picker-parent-uuid="pickerParentUuid"
            @selected="onSelected"
            @created="onCreated"
            @metadata-submitted="onMetadataSubmitted"
            @terminal-selected="onTerminalSelected"
          />
        </section>
        <aside v-if="hasRail" :aria-labelledby="railHeadingId">
          <h2
            :id="railHeadingId"
            class="text-table font-bold text-text-light mb-2"
          >
            {{ $t("repetitiveForm.created-this-session") }}
          </h2>
          <RepetitiveOverview
            :branches="branches"
            :steps="flowConfig?.steps ?? []"
            :repeatable="flowConfig?.repeatable ?? false"
            :undoable="!isChainInProgress && !isCommitting"
            @remove="onRemoveBranch"
            @undo="onUndoBranch"
          />
        </aside>
      </div>

      <div
        v-if="view === 'step'"
        class="flex items-center justify-between gap-3 mt-6"
      >
        <div class="w-fit">
          <BaseButtonNew
            v-if="canGoBack"
            data-testid="repetitive-flow-back"
            :label="$t('repetitiveForm.back-to-previous-step')"
            :icon="DamsIcons.AngleLeft"
            button-style="ghost"
            button-size="sm"
            @click="goBack"
          />
        </div>
        <div v-if="hasRail" class="w-fit">
          <BaseButtonNew
            data-testid="repetitive-flow-save-close"
            :label="$t('repetitiveForm.save-and-close')"
            :icon="DamsIcons.Check"
            button-style="commit"
            button-size="sm"
            :disabled="!canSaveAndClose"
            :tooltip-label="
              isChainInProgress ? $t('repetitiveForm.finish-current-first') : ''
            "
            :loading="isCommitting"
            @click="onFinish"
          />
        </div>
      </div>

      <template v-else-if="view === 'finalize'">
        <div class="w-fit mb-4">
          <BaseButtonNew
            data-testid="repetitive-flow-back-to-overview"
            :label="$t('repetitiveForm.back-to-previous-step')"
            :icon="DamsIcons.AngleLeft"
            button-style="ghost"
            button-size="sm"
            @click="view = 'step'"
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
import { ref, computed, watch, useId } from "vue";
import { useRoute, useRouter } from "vue-router";
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
  primaryEntity,
  undoPlan,
  toDisplayValue,
} from "@/composables/useRepetitiveForm";
import useEntityPickerModal from "@/composables/useEntityPickerModal";
import { useManageEntities } from "@/composables/useManageEntities";
import {
  BulkOperationsContextEnum,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import useEntitySingle from "@/composables/useEntitySingle";
import { useModalActions } from "@/composables/useModalActions";
import { useConfirmModal } from "@/composables/useConfirmModal";
import { useBaseNotification } from "@/composables/useBaseNotification";
import { asString } from "@/helpers";
import { useAsyncAction } from "@/composables/useAsyncAction";
import { useBlockingLoader } from "@/composables/useBlockingLoader";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { Unicons } from "@/types";
import RepetitiveStepModal from "@/components/repetitiveForm/RepetitiveStepModal.vue";
import RepetitiveStepField from "@/components/repetitiveForm/RepetitiveStepField.vue";
import RepetitiveOverview from "@/components/repetitiveForm/RepetitiveOverview.vue";
import RepetitiveCreateButton from "@/components/repetitiveForm/RepetitiveCreateButton.vue";
import DynamicForm from "@/components/dynamicForms/DynamicForm.vue";

const FLOW_ID = "repetitive-flow";

const props = defineProps<{ open: boolean; config: RepetitiveForm }>();
const emit = defineEmits<{
  (e: "close"): void;
  (
    e: "finished",
    entity: {
      id?: string;
      uuid?: string;
      type?: string;
      [key: string]: unknown;
    },
  ): void;
}>();

const store = useRepetitiveForm();
const { flowConfig, currentStepIndex, currentBranch, branches } = store;
const { setEntityId, resetState: resetEntityPickerState } =
  useEntityPickerModal();
const { dequeueAllItemsForBulkProcessing } = useBulkOperations();
const { getEntityUuid } = useEntitySingle();
const { getCallbackFunctions } = useModalActions();
const { confirm } = useConfirmModal();
const { displayErrorNotification } = useBaseNotification();
const { run } = useAsyncAction();
const { deleteEntity } = useManageEntities();
const { startBlocking, stopBlocking } = useBlockingLoader();
const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const view = ref<"step" | "finalize">("step");
const railHeadingId = useId();
let hasStarted = false;
const hostEntityId = ref<string | undefined>(undefined);
const lastPicked = ref<Record<string, any> | undefined>(undefined);

const activeStep = computed(() => store.activeStep());

// Linear and pick-and-return flows don't collect chains, so they get no rail
const hasRail = computed(
  () => !flowConfig.value?.linear && !flowConfig.value?.returnsSelection,
);
const isChainInProgress = computed(
  () =>
    currentStepIndex.value > 0 ||
    Object.keys(currentBranch.value.entities).length > 0,
);
// A non-repeatable flow is done after its one chain: no new step 1
const isChainDone = computed(
  () => !flowConfig.value?.repeatable && branches.value.length > 0,
);
const canGoBack = computed(
  () =>
    activeStep.value?.showBackButton !== false &&
    !isChainDone.value &&
    (currentStepIndex.value > 0 ||
      (hasRail.value && isChainInProgress.value)),
);
const canSaveAndClose = computed(
  () => branches.value.length > 0 && !isChainInProgress.value,
);

// guided-flow.md: the dialog is named by the flow; the step strip shows the position
const modalTitle = computed(() => {
  const flowLabel = flowConfig.value?.label;
  return flowLabel ? t(flowLabel) : "";
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
  return (scopeStep && primaryEntity(currentBranch.value, scopeStep)?.id) || "";
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
  hasStarted = true;
  store.initFlow(props.config);
  setEntityId(FLOW_ID);
  hostEntityId.value =
    getEntityUuid() || asString(route.params.id) || undefined;
  view.value = "step";
};

const advance = async (
  completeCurrentStep: () => void = store.completeStep,
) => {
  const wasLast = store.isLastStep();
  if (wasLast && store.isLinear()) {
    if (flowConfig.value?.returnsSelection) {
      if (lastPicked.value) emit("finished", lastPicked.value);
      return;
    }
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
  // after the last step the store files the chain and starts the next on step 1
  completeCurrentStep();
};

const onSelected = (entities: { id: string; label?: string }[]) =>
  run(async () => {
    lastPicked.value = entities[0];
    store.pickExisting(entities);
    // persist the link to the prior step before advancing (link-on-select)
    const step = activeStep.value;
    startBlocking();
    try {
      if (step) await store.linkOnSelect(step);
    } finally {
      // advance() can emit "finished", which closes the flow; stop blocking
      // first so the app-wide overlay never flashes as the modal unmounts
      stopBlocking();
    }
    await advance();
  });

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
  const step = activeStep.value;
  if (step) {
    store.stagePendingHostRelation(step, values);
  }
  if (step) {
    store.recordEntity({
      key: step.key,
      id: "",
      type: step.entityType as Entitytyping,
      isNew: false,
      details: Object.entries(values)
        .map(([key, value]) => ({
          label: `metadata.labels.${key.replace(/_/g, "-")}`,
          value: toDisplayValue(value),
        }))
        .filter((detail) => detail.value),
    });
  }
  advance(store.completeMetadataOnlyStep);
};

const onTerminalSelected = (items: Record<string, any>[]) => {
  const entity = items?.[0];
  if (!entity) return;
  emit("finished", entity);
};

const onRemoveBranch = (index: number) => {
  store.removeBranch(index);
};

// Undo deletes only the records this chain created (undoPlan); records the
// user picked stay. On failure the chain stays in the rail.
const onUndoBranch = async (index: number) => {
  const branch = branches.value[index];
  const deletes = branch ? undoPlan(branch) : null;
  if (!deletes?.length) return;
  startBlocking();
  try {
    for (const entityToDelete of deletes) {
      await deleteEntity(entityToDelete);
    }
    store.removeBranch(index);
  } catch (error: any) {
    displayErrorNotification(
      "repetitiveForm.undo-failed-title",
      commitFailureText(error),
    );
  } finally {
    stopBlocking();
  }
};

const goBack = () => {
  if (currentStepIndex.value > 0) {
    store.goToPreviousStep();
    return;
  }
  // leaving from the first step abandons the branch in progress
  store.startNewBranch();
};

const isCommitting = ref(false);

const commitFailureText = (error: any): string =>
  error?.graphQLErrors?.[0]?.extensions?.response?.body?.message ||
  error?.message ||
  "repetitiveForm.finish-failed-description";

const onFinish = async () => {
  if (isCommitting.value) return;
  // a flow opened from the menu has no host; it only needs one to link to
  const needsHost = branches.value.some(
    (branch) => branch.pendingHostRelations.length > 0,
  );
  if (needsHost && !hostEntityId.value) {
    displayErrorNotification(
      "repetitiveForm.finish-failed-title",
      "repetitiveForm.finish-failed-description",
    );
    return;
  }
  isCommitting.value = true;
  try {
    if (hostEntityId.value)
      await store.commitPendingHostRelations(hostEntityId.value);
  } catch (error: any) {
    displayErrorNotification(
      "repetitiveForm.finish-failed-title",
      commitFailureText(error),
    );
    isCommitting.value = false;
    return;
  }
  isCommitting.value = false;
  for (const callback of getCallbackFunctions() ?? []) {
    if (callback) await callback();
  }
  if (!flowConfig.value?.finalize) {
    emit("finished", {});
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
  !flowConfig.value?.returnsSelection &&
  (branches.value.length > 0 ||
    Object.keys(currentBranch.value.entities).length > 0);

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
  hostEntityId.value = undefined;
  selectedFinalizeType.value = null;
  lastPicked.value = undefined;
  view.value = "step";
  if (!hasStarted) return;
  hasStarted = false;
  dequeueAllItemsForBulkProcessing(
    BulkOperationsContextEnum.GuidedFlowStepPicker,
  );
  resetEntityPickerState();
};

watch(
  () => props.open,
  (isOpen) => (isOpen ? start() : reset()),
  { immediate: true },
);
</script>
