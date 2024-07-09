<template>
  <base-modal
    :modal-state="getModalInfo(TypeModals.SaveSearch).state"
    :modal-position="getModalInfo(TypeModals.SaveSearch).modalPosition"
    modal-width-style="w-2/5"
    modal-color="bg-neutral-white"
    modalHeightStyle="max-h-[75vh] my-[12.5vh]"
    @hide-modal="handleCloseModal"
  >
    <div class="bg-neutral-0 w-full">
      <dynamic-form
        v-if="getModalInfo(TypeModals.SaveSearch).state === ModalState.Show"
        :dynamic-form-query="getModalInfo(TypeModals.SaveSearch).formQuery"
        :saved-context="getModalInfo(TypeModals.SaveSearch).savedContext"
        :tab-name="''"
        @entityCreated="saveFilter"
      />
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import BaseModal from "@/components/base/BaseModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { TypeModals, ModalState } from "@/generated-types/queries";
import { useI18n } from "vue-i18n";
import { useSaveSearchHepler } from "@/composables/useSaveSearchHepler";
import DynamicForm from "./dynamicForms/DynamicForm.vue";

const { closeModal, getModalInfo } = useBaseModal();
const { t } = useI18n();
const {
  setFilterToEdit,
  setActiveFilter,
  fetchSavedSearchById,
  normalizeSavedSearchFromEntity,
} = useSaveSearchHepler();

const saveFilter = async (entity: any) => {
  const savedSearch = await fetchSavedSearchById(entity.uuid || entity.id);
  if (!entity) {
    return closeModal(TypeModals.SaveSearch);
  }
  setActiveFilter(normalizeSavedSearchFromEntity(savedSearch));
  closeModal(TypeModals.SaveSearch);
};

const handleCloseModal = () => {
  closeModal(TypeModals.SaveSearch);
  setFilterToEdit(null);
};
</script>
