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
        <BaseTabs v-if="shouldRenderTabs" class="h-full">
          <BaseTab :title="t('entity.upload')">
            <DynamicForm
                v-if="getModalInfo(TypeModals.DynamicForm).state === ModalState.Show"
                :dynamic-form-query="getModalInfo(TypeModals.DynamicForm).formQuery"
                :router="useRouter()"
                @dynamicFormReady="handleDynamicFormReady"
            />
          </BaseTab>
          <BaseTab v-if="hasFileSystemImport" :title="t('entity.import')">
            <DynamicForm
                v-if="getModalInfo(TypeModals.DynamicForm).state === ModalState.Show"
                :dynamic-form-query="getModalInfo(TypeModals.DynamicForm).formQuery"
                :router="useRouter()"
                @dynamicFormReady="handleDynamicFormReady"
                :import-available="true"
            />
          </BaseTab>
        </BaseTabs>
        <DynamicForm
            v-else-if="getModalInfo(TypeModals.DynamicForm).state === ModalState.Show"
            :dynamic-form-query="getModalInfo(TypeModals.DynamicForm).formQuery"
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

const { closeModal, getModalInfo } = useBaseModal();
const { t } = useI18n();

const formTabs = ref([]);
const formFields = ref([]);
const handleDynamicFormReady = (event) => {
  formTabs.value = event.formTabs;
  formFields.value = event.formFields;
};

onMounted(() => {
  window.addEventListener('dynamicFormReady', handleDynamicFormReady);

  onUnmounted(() => {
    window.removeEventListener('dynamicFormReady', handleDynamicFormReady);
  });
});

const hasFileSystemImport = computed(() => {
  const obj = formFields.value;
  if (!obj || typeof obj !== 'object') return false;

  const hasFileSystemImport = Object.values(obj).some(item => item && item.key === "fileSystemImport");

  return hasFileSystemImport;
});

const shouldRenderTabs = computed(() => {
  const obj = { ...formTabs.value };
  const formTabValues = Object.values(obj);
  const formTabArray = formTabValues.filter(item => item.__typename === "FormTab");

  return formTabArray.length > 1;
});
</script>

<style scoped></style>
