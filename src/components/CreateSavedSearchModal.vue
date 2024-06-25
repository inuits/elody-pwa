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
      <div class="p-6">
        <h1>
          {{ $t("saved-searches.search-title") }}
        </h1>

        <input
          v-model="searchTitle"
          type="text"
          class="bg-neutral-0 py-2 pl-4 w-full rounded min-w-48 text-neutral-700 text-sm focus:outline-none"
        />

        <BaseButton
          bg-color="neutral-30"
          :class="
            searchTitle.length > 0 ? 'mt-2 opacity-100' : 'mt-2 opacity-40'
          "
          style="margin-left: -1px"
          :label="
            createModalState.action === 'create'
              ? $t('form.create')
              : $t('saved-searches.edit')
          "
          @click="create"
        />
      </div>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import BaseModal from "@/components/base/BaseModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import BaseButton from "./base/BaseButton.vue";
import {
  type Form,
  type FormTab,
  ModalState,
  TypeModals,
} from "@/generated-types/queries";
import { useI18n } from "vue-i18n";
import { onMounted, ref } from "vue";
import { useConfirmModal } from "@/composables/useConfirmModal";

const { closeModal, getModalInfo, changeCloseConfirmation } = useBaseModal();
const { initializeConfirmModal } = useConfirmModal();
const { t } = useI18n();
const searchTitle = ref<string>("");

onMounted(() => {
  initializeConfirmModal({
    confirmButton: {
      buttonCallback: () => {
        changeCloseConfirmation(TypeModals.SaveSearch, false);
        closeModal(TypeModals.SaveSearch);
      },
    },
    declineButton: { buttonCallback: () => closeModal(TypeModals.SaveSearch) },
    translationKey: "discard-modal",
  });
});

const handleCloseModal = () => {
  closeModal(TypeModals.SaveSearch);
};
</script>
