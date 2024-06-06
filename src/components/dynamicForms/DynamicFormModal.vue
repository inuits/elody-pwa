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
    modalHeightStyle="max-h-[75vh] my-[12.5vh]"
    @hide-modal="closeModal(TypeModals.DynamicForm)"
  >
    <div class="flex flex-col w-full h-full overflow-auto">
      <template v-if="shouldRenderTabs" class="h-full">
        <baseTabs :tabs="tabsTitles">
          <baseTab v-for="(formTab, tabIndex) in formTabArray" :key="tabIndex">
            <dynamic-form
                v-if="getModalInfo(TypeModals.DynamicForm).state === ModalState.Show"
                key="getModalInfo(TypeModals.DynamicForm).formQuery"
                :dynamic-form-query="getModalInfo(TypeModals.DynamicForm).formQuery"
                :saved-context="getModalInfo(TypeModals.DynamicForm).savedContext"
                :router="useRouter()"
                :modal-form-fields="formTab.formFields"
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
      />
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from "@/components/base/BaseModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import {Form, FormTab, ModalState, TypeModals} from "@/generated-types/queries";
import DynamicForm from "@/components/dynamicForms/DynamicForm.vue";
import { useRouter } from "vue-router";
import BaseTabs from "@/components/BaseTabs.vue";
import BaseTab from "@/components/BaseTab.vue";
import { useI18n } from "vue-i18n";
import { onMounted, computed, ref, watchEffect } from 'vue';
import { useConfirmModal } from "@/composables/useConfirmModal";
import { getDynamicFormTabs } from '@/components/dynamicForms/useDynamicForm';

const formTabs = ref<Form | null>(null);
const { closeModal, getModalInfo, changeCloseConfirmation } = useBaseModal();
const { initializeConfirmModal } = useConfirmModal();
const { t } = useI18n();

watchEffect(() => {
  (async () => {
    if (!formTabs.value) {
      formTabs.value = await getDynamicFormTabs();
    }
  })();
});

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
});

const tabsTitles = computed(() => {
  return Object.values(formTabs.value ?? {})
      .flatMap(value =>
          Object.entries(value)
              .filter(([_, nestedValue]) => nestedValue.__typename === 'FormTab')
              .map(([nestedKey, _]) => t("entity." + nestedKey))
      );
});

const shouldRenderTabs = computed(() => {
  const countFormTabs = (obj: Record<string, any>): number =>
      Object.values(obj).reduce((count, value) =>
              count + (value?.__typename === 'FormTab' ? 1 : typeof value === 'object' ? countFormTabs(value) : 0),
          0
      );

  return formTabs.value ? countFormTabs(formTabs.value) > 1 : false;
});

const formTabArray = computed(() => {
  const extractFormTabs = (obj: Record<string, any>): FormTab[] =>
      Object.values(obj).flatMap(value =>
          (value?.__typename === 'FormTab' && [value]) ||
          (typeof value === 'object' && value !== null && extractFormTabs(value)) ||
          []
      );

  return formTabs.value ? extractFormTabs(formTabs.value) : [];
});
</script>

<style scoped></style>
