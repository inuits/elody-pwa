<template>
  <DynamicFormModal />
  <SavedSearchesPickerModal />
  <CreateSavedSearchModal />
  <BulkoperationsModal v-if="route.name !== undefined" />
  <search-modal />
  <search-modal-ai />
  <EntityDetailModal />
  <ConfirmModal><ConfirmModalView /></ConfirmModal>
  <EntityEditModal />
  <IiifOperationsModal />
  <InfoPanelHost />
  <GuidedFlowModalHost />
</template>

<script setup lang="ts">
import BulkoperationsModal from "@/components/bulk-operations/BulkOperationsModal.vue";
import ConfirmModal from "@/components/base/ConfirmModal.vue";
import ConfirmModalView from "@/components/ConfirmModalView.vue";
import DynamicFormModal from "@/components/dynamicForms/DynamicFormModal.vue";
import SearchModal from "@/components/modals/SearchModal.vue";
import SavedSearchesPickerModal from "@/components/modals/SavedSearchesPickerModal.vue";
import EntityEditModal from "@/components/modals/EntityEditModal.vue";
import CreateSavedSearchModal from "@/components/CreateSavedSearchModal.vue";
import EntityDetailModal from "@/components/modals/EntityDetailModal.vue";
import IiifOperationsModal from "@/components/modals/IiifOperationsModal.vue";
import InfoPanelHost from "@/components/base/InfoPanelHost.vue";
import GuidedFlowModalHost from "@/components/repetitiveForm/GuidedFlowModalHost.vue";
import { useRoute } from "vue-router";

const route = useRoute();
</script>
