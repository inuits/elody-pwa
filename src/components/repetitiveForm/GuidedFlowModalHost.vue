<template>
  <RepetitiveStepModal
    :open="isOpen && isLoadingConfig"
    @close="closeModal(TypeModals.GuidedFlow)"
  >
    <div class="w-full flex justify-center py-8">
      <SpinnerLoader theme="accent" :dimensions="16" />
    </div>
  </RepetitiveStepModal>
  <RepetitiveFlow
    :open="isOpen && config.steps.length > 0"
    :config="config"
    @close="closeModal(TypeModals.GuidedFlow)"
    @finished="onFinished"
  />
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { TypeModals, type RepetitiveForm } from "@/generated-types/queries";
import { apolloClient } from "@/main";
import { useBaseModal } from "@/composables/useBaseModal";
import { useModalActions } from "@/composables/useModalActions";
import { useImport } from "@/composables/useImport";
import { toRepetitiveFormConfig } from "@/composables/useRepetitiveFlowConfig";
import RepetitiveFlow from "@/components/repetitiveForm/RepetitiveFlow.vue";
import RepetitiveStepModal from "@/components/repetitiveForm/RepetitiveStepModal.vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";

const emptyConfig = (): RepetitiveForm => ({
  repeatable: false,
  steps: [],
});

const { loadDocument } = useImport();
const { getModalInfo, closeModal } = useBaseModal();
const { getCallbackFunctions } = useModalActions();
const router = useRouter();

const refreshAfterFlow = async (callbacks?: Function[]) => {
  if (callbacks?.length) {
    for (const callback of callbacks) {
      try {
        await callback?.();
      } catch (error) {
        console.error("Failed to refresh after the guided flow:", error);
      }
    }
    return;
  }
  await apolloClient.refetchQueries({ include: "active" });
};

const config = ref<RepetitiveForm>(emptyConfig());
const isLoadingConfig = ref<boolean>(false);
const isOpen = computed(() => getModalInfo(TypeModals.GuidedFlow).open);

// The modal's formQuery carries the name of the self-describing query that
// holds the flow configuration (e.g. "GetRepetitiveFormForOmnibus").
const fetchFlowConfig = async () => {
  config.value = emptyConfig();
  isLoadingConfig.value = true;
  try {
    const queryName = getModalInfo(TypeModals.GuidedFlow).formQuery;
    if (!queryName) return;
    const document = await loadDocument(queryName);
    if (!document) return;
    const result = await apolloClient.query({
      query: document,
      fetchPolicy: "no-cache",
    });
    config.value = toRepetitiveFormConfig(result.data?.GetRepetitiveForm);
  } finally {
    isLoadingConfig.value = false;
  }
};

watch(
  isOpen,
  (open) => {
    if (open) fetchFlowConfig();
    // clear the config on close so a stale previous-flow config can't briefly
    // drive `props.open`/`start()` on the next open (which showed the prior
    // flow's last step); the next open refetches the correct config
    else config.value = emptyConfig();
  },
  { immediate: true },
);

const onFinished = async (entity: {
  id?: string;
  uuid?: string;
  type?: string;
}) => {
  const isHostTerminal = Boolean(config.value.finalizeOnHost);
  // capture the refetch callbacks registered when the flow was opened before
  // closing the modal clears the shared modal-action state
  const refetchCallbacks = getCallbackFunctions();
  closeModal(TypeModals.GuidedFlow);

  if (isHostTerminal) {
    await refreshAfterFlow(refetchCallbacks);
    return;
  }

  const entityId = entity.id ?? entity.uuid;
  if (!entityId) {
    // a repeatable/no-finalize flow finished: no single entity to route to.
    // Refresh the list(s) the flow created into when it opts in.
    if (config.value.refetchOnFinish) await refreshAfterFlow(refetchCallbacks);
    return;
  }

  const entityType = entity.type ?? config.value.finalize?.entityType;
  const routeName = config.value.routeToRoute ?? "SingleEntity";
  const params =
    routeName === "SingleEntity"
      ? { id: entityId, type: entityType }
      : { id: entityId };

  if (entityId) router.push({ name: routeName, params });
};
</script>
