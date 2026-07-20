<template>
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
import { useImport } from "@/composables/useImport";
import { toRepetitiveFormConfig } from "@/composables/useRepetitiveFlowConfig";
import RepetitiveFlow from "@/components/repetitiveForm/RepetitiveFlow.vue";

const emptyConfig = (): RepetitiveForm => ({
  repeatable: false,
  steps: [],
});

const { loadDocument } = useImport();
const { getModalInfo, closeModal } = useBaseModal();
const router = useRouter();

const config = ref<RepetitiveForm>(emptyConfig());
const isOpen = computed(() => getModalInfo(TypeModals.GuidedFlow).open);

// The modal's formQuery carries the name of the self-describing query that
// holds the flow configuration (e.g. "GetRepetitiveFormForOmnibus").
const fetchFlowConfig = async () => {
  config.value = emptyConfig();
  const queryName = getModalInfo(TypeModals.GuidedFlow).formQuery;
  if (!queryName) return;
  const document = await loadDocument(queryName);
  if (!document) return;
  const result = await apolloClient.query({
    query: document,
    fetchPolicy: "no-cache",
  });
  config.value = toRepetitiveFormConfig(result.data?.GetRepetitiveForm);
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
  closeModal(TypeModals.GuidedFlow);

  if (isHostTerminal) {
    await apolloClient.refetchQueries({ include: "active" });
    return;
  }

  const entityId = entity.id ?? entity.uuid;
  const entityType = entity.type ?? config.value.finalize?.entityType;
  const routeName = config.value.routeToRoute ?? "SingleEntity";
  const params =
    routeName === "SingleEntity"
      ? { id: entityId, type: entityType }
      : { id: entityId };

  if (entityId) router.push({ name: routeName, params });
};
</script>
