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
      <div class="px-4 pb-4">
        <h1 class="title pb-4">
          {{ $t("saved-searches.search-title") }}
        </h1>

        <BaseInputTextNumberDatetime
          v-if="filterToEdit"
          v-model:model-value="filterToEdit.title"
          type="text"
          input-style="defaultWithBorder"
        />

        <BaseButtonNew
          class="mt-4"
          button-style="accentAccent"
          label="save"
          :disabled="!filterToEdit?.title"
          @click="saveFilter"
        />
      </div>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import BaseModal from "@/components/base/BaseModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { TypeModals } from "@/generated-types/queries";
import { useI18n } from "vue-i18n";
import { onMounted, computed } from "vue";
import { useConfirmModal } from "@/composables/useConfirmModal";
import BaseInputTextNumberDatetime from "@/components/base/BaseInputTextNumberDatetime.vue";
import { useSaveSearchHepler } from "@/composables/useSaveSearchHepler";

const { closeModal, getModalInfo, changeCloseConfirmation } = useBaseModal();
const { initializeConfirmModal } = useConfirmModal();
const { t } = useI18n();
const { getFilterToEdit, setFilterToEdit, setActiveFilter } =
  useSaveSearchHepler();

onMounted(() => {
  initializeConfirmModal({
    confirmButton: {
      buttonCallback: () => {
        changeCloseConfirmation(TypeModals.SaveSearch, false);
        closeModal(TypeModals.SaveSearch);
      },
    },
    declineButton: {
      buttonCallback: () => {
        closeModal(TypeModals.SaveSearch);
        setFilterToEdit(null);
      },
    },
    translationKey: "discard-modal",
  });
});

const filterToEdit = computed(() => {
  return getFilterToEdit();
});

const saveFilter = async () => {
  // TODO(savedSearch): await call to save filter
  setActiveFilter(filterToEdit.value);
  closeModal(TypeModals.SaveSearch);
};

const handleCloseModal = () => {
  closeModal(TypeModals.SaveSearch);
  setFilterToEdit(null);
};
</script>
