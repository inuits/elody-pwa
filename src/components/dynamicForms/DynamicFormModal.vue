<template>
  <BaseModal
    :modalType="TypeModals.DynamicForm"
    :cancel-button-availabe="false"
    :modal-color="
      getModalInfo(TypeModals.DynamicForm).formQuery === 'GetUploadForm'
        ? 'bg-neutral-lightest'
        : 'bg-neutral-white'
    "
    :modalHeightStyle="'max-h-[90vh] my-auto'"
    @hide-modal="handleCloseModal"
  >
    <div class="flex flex-col w-full h-full overflow-auto">
      <template v-if="shouldRenderTabs" class="h-full">
        <baseTabs :tabs="tabsTitles">
          <baseTab v-for="(formTab, tabIndex) in formTabArray" :key="tabIndex">
            <dynamic-form
              v-if="getModalInfo(TypeModals.DynamicForm).open"
              :key="getModalInfo(TypeModals.DynamicForm).formQuery"
              :dynamic-form-query="
                getModalInfo(TypeModals.DynamicForm).formQuery
              "
              :router="useRouter()"
              :modal-form-fields="formTab.formFields"
              :tab-name="tabsTitles[tabIndex]"
            />
          </baseTab>
        </baseTabs>
      </template>
      <div class="h-full">
        <dynamic-form
          v-if="getModalInfo(TypeModals.DynamicForm).open && !shouldRenderTabs"
          :key="getModalInfo(TypeModals.DynamicForm).formQuery"
          :dynamic-form-query="getModalInfo(TypeModals.DynamicForm).formQuery"
          :router="useRouter()"
          :tab-name="''"
        />
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from "@/components/base/BaseModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { type Form, type FormTab, TypeModals } from "@/generated-types/queries";
import DynamicForm from "@/components/dynamicForms/DynamicForm.vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { onMounted, computed, ref, watch, watchEffect } from "vue";
import { useConfirmModal } from "@/composables/useConfirmModal";
import { useDynamicForm } from "@/components/dynamicForms/useDynamicForm";
import BaseTab from "@/components/BaseTab.vue";
import BaseTabs from "@/components/BaseTabs.vue";
import useUpload from "@/composables/useUpload";

const formTabs = ref<Form | null>(null);
const { closeModal, getModalInfo, changeCloseConfirmation } = useBaseModal();
const { initializeConfirmModal } = useConfirmModal();
const { t } = useI18n();
const { getDynamicFormTabs } = useDynamicForm();
const { resetUpload } = useUpload();

watchEffect(() => {
  (async () => {
    if (!formTabs.value) {
      formTabs.value = await getDynamicFormTabs();
    }
  })();
});

// TODO: Move formTab code to dynamicForm composable
const clearFormTabs = () => {
  formTabs.value = null;
};

watch(
  () => getModalInfo(TypeModals.DynamicForm).open,
  (modalIsOpen) => {
    if (modalIsOpen) {
      clearFormTabs();
    }
  }
);

watch(
  () => formTabs.value,
  () => {
    if (formTabs.value) initializeModal();
  }
);

onMounted(() => {
  initializeModal();
});

const initializeModal = () => {
  initializeConfirmModal({
    confirmButton: {
      buttonCallback: () => {
        changeCloseConfirmation(TypeModals.DynamicForm, false);
        closeModal(TypeModals.DynamicForm);
      },
    },
    declineButton: { buttonCallback: () => closeModal(TypeModals.Confirm) },
    translationKey: "discard-modal",
  });
};

const tabsTitles = computed(() => {
  return Object.values(formTabs.value ?? {}).flatMap((value) =>
    Object.entries(value)
      .filter(([_, nestedValue]) => nestedValue.__typename === "FormTab")
      .map(([nestedKey, _]) => t("entity." + nestedKey))
  );
});

const shouldRenderTabs = computed(() => {
  const countFormTabs = (obj: Record<string, any>): number =>
    Object.values(obj).reduce(
      (count, value) =>
        count +
        (value?.__typename === "FormTab"
          ? 1
          : typeof value === "object"
          ? countFormTabs(value)
          : 0),
      0
    );

  return formTabs.value ? countFormTabs(formTabs.value) > 1 : false;
});

const formTabArray = computed(() => {
  const extractFormTabs = (obj: Record<string, any>): FormTab[] =>
    Object.values(obj).flatMap(
      (value) =>
        (value?.__typename === "FormTab" && [value]) ||
        (typeof value === "object" &&
          value !== null &&
          extractFormTabs(value)) ||
        []
    );

  return formTabs.value ? extractFormTabs(formTabs.value) : [];
});

const handleCloseModal = () => {
  closeModal(TypeModals.DynamicForm);
  clearFormTabs();
  resetUpload();
};
</script>

<style scoped></style>
