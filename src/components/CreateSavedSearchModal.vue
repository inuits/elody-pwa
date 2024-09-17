<template>
  <base-modal
    :modal-type="TypeModals.SaveSearch"
    modal-color="bg-neutral-white"
    modalHeightStyle="max-h-[75vh] my-[12.5vh]"
    @hide-modal="handleCloseModal"
  >
    <div class="bg-neutral-0 w-full">
      <dynamic-form
        v-if="getModalInfo(TypeModals.SaveSearch).open"
        :dynamic-form-query="getModalInfo(TypeModals.SaveSearch).formQuery"
        :saved-context="getModalInfo(TypeModals.SaveSearch).savedContext"
        :tab-name="''"
        @entityCreated="saveFilter"
      />
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { watch } from "vue";
import BaseModal from "@/components/base/BaseModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { TypeModals } from "@/generated-types/queries";
import { useI18n } from "vue-i18n";
import { useSaveSearchHepler } from "@/composables/useSaveSearchHepler";
import DynamicForm from "./dynamicForms/DynamicForm.vue";
import { useFormHelper } from "@/composables/useFormHelper";
import { useAuth } from "session-vue-3-oidc-library";

const { closeModal, getModalInfo } = useBaseModal();
const { t } = useI18n();
const {
  setActiveFilter,
  fetchSavedSearchById,
  normalizeSavedSearchFromEntity,
  getUserByEmail,
} = useSaveSearchHepler();
const auth = useAuth();
const { addRelations } = useFormHelper();

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
};

watch(
  () => getModalInfo(TypeModals.SaveSearch).open,
  async (isOpen: boolean) => {
    if (isOpen) {
      const user = await getUserByEmail(auth.user.email);
      if (!user) return;

      addRelations(
        [{ id: user.uuid, value: user.uuid }],
        "hasUser",
        getModalInfo(TypeModals.SaveSearch).formQuery
      );
    }
  }
);
</script>
