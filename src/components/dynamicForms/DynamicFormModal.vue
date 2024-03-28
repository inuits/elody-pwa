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
      <template v-if="getModalInfo(TypeModals.DynamicForm).formQuery === 'GetUploadForm'">
        <BaseTabs class="h-full" :onTabClick="onTabClick">
          <BaseTab :title="t('entity.upload')">
            <DynamicForm
              v-if="getModalInfo(TypeModals.DynamicForm).state === ModalState.Show"
              :dynamic-form-query="getModalInfo(TypeModals.DynamicForm).formQuery"
              :router="useRouter()"
            />
          </BaseTab>
          <BaseTab :title="'Import'">
            <ImportComponent :selectedIndex="selectedIndex" />
          </BaseTab>
        </BaseTabs>
      </template>
      <template v-else>
        <DynamicForm
          v-if="getModalInfo(TypeModals.DynamicForm).state === ModalState.Show"
          :dynamic-form-query="getModalInfo(TypeModals.DynamicForm).formQuery"
          :router="useRouter()"
        />
      </template>
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
import ImportComponent from "@/components/ImportComponent.vue";
import { ref } from 'vue';

const { closeModal, getModalInfo } = useBaseModal();
const { t } = useI18n();
const selectedIndex = ref(0);

const onTabClick = (index: number) => {
  selectedIndex.value = index;
};
</script>

<style scoped></style>
