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
  },
  { immediate: true },
);

const onFinished = (entity: { id?: string; uuid?: string; type?: string }) => {
  closeModal(TypeModals.GuidedFlow);

  const entityId = entity.id ?? entity.uuid;
  const entityType = entity.type ?? config.value.finalize?.entityType;
  if (entityId && entityType) {
    router.push({
      name: "SingleEntity",
      params: { id: entityId, type: entityType },
    });
  }
};
</script>
