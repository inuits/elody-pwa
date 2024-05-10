<template>
  <BaseModal
    :modal-state="getModalInfo(TypeModals.DynamicForm).state"
    :modal-position="getModalInfo(TypeModals.DynamicForm).modalPosition"
    modal-width-style="w-2/5"
    :modal-color="
      getModalInfo(TypeModals.DynamicForm).formQuery === 'GetUploadForm'
        ? 'bg-neutral-lightest'
        : 'bg-neutral-white'
    "
    @hide-modal="closeModal(TypeModals.DynamicForm)"
  >
    <div class="flex flex-col w-full h-full overflow-auto">
      <template v-if="shouldRenderTabs" class="h-full">
        <baseTabs :tabs="tabsTitles">
          <baseTab v-for="(tabName, tabIndex) in filteredTabs" :title="tabName" :key="tabIndex">
            <dynamic-form
                v-if="getModalInfo(TypeModals.DynamicForm).state === ModalState.Show"
                key="getModalInfo(TypeModals.DynamicForm).formQuery"
                :dynamic-form-query="getModalInfo(TypeModals.DynamicForm).formQuery"
                :saved-context="getModalInfo(TypeModals.DynamicForm).savedContext"
                :router="useRouter()"
                 @dynamicFormReady="handleDynamicFormReady"
                :import-available=formTabs[tabName].formFields.fileSystemImporter
            />
          </baseTab>
        </baseTabs>
      </template>
      <dynamic-form
          v-else-if="getModalInfo(TypeModals.DynamicForm).state === ModalState.Show"
          key="getModalInfo(TypeModals.DynamicForm).formQuery"
          :dynamic-form-query="getModalInfo(TypeModals.DynamicForm).formQuery"
          :saved-context="getModalInfo(TypeModals.DynamicForm).savedContext"
          :router="useRouter()"
          @dynamicFormReady="handleDynamicFormReady"
      />
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from "@/components/base/BaseModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { ModalState, TypeModals } from "@/generated-types/queries";
import DynamicForm from "@/components/dynamicForms/DynamicForm.vue";
import { useRouter } from "vue-router";
import BaseTabs from "@/components/BaseTabs.vue";
import BaseTab from "@/components/BaseTab.vue";
import { useI18n } from "vue-i18n";
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useConfirmModal } from "@/composables/useConfirmModal";

const { closeModal, getModalInfo, changeCloseConfirmation } = useBaseModal();
const { initializeConfirmModal } = useConfirmModal();
const { t } = useI18n();

const formTabs = ref([]);
const formFields = ref([]);
const tabsTitle = ref([]);
const handleDynamicFormReady = (event) => {
  formTabs.value = event.formTabs;
  formFields.value = event.formFields;
  tabsTitle.value = event.tabsTitle;
};

onMounted(() => {
  initializeConfirmModal(
    () => {
      changeCloseConfirmation(TypeModals.DynamicForm, false);
      closeModal(TypeModals.DynamicForm);
    },
    undefined,
    () => closeModal(TypeModals.Confirm),
    "discard-modal"
  );

  window.addEventListener('dynamicFormReady', handleDynamicFormReady);

  onUnmounted(() => {
    window.removeEventListener('dynamicFormReady', handleDynamicFormReady);
  });
});

const tabsTitles = computed(() => {
  const filteredArray = Object.values(tabsTitle._rawValue)
      .filter(item => item && item.title)
      .map(item => t("entity."+item.title));

  return filteredArray;
});

const shouldRenderTabs = computed(() => {
  const obj = { ...formTabs.value };
  const formTabValues = Object.values(obj);
  const formTabArray = formTabValues.filter(item => item.__typename === "FormTab");

  return formTabArray.length > 1;
});

const filteredTabs = computed(() => {
  const filtered = Object.keys(formTabs.value).filter(key => key !== '__typename');
  return filtered;
});
</script>

<style scoped></style>
