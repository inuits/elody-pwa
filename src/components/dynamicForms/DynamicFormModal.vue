<template>
  <BaseModal
    :modal-state="getModalInfo(TypeModals.DynamicForm).state"
    :modal-position="getModalInfo(TypeModals.DynamicForm).modalPosition"
    modal-width-style="w-2/5"
    modal-color="bg-neutral-lightest"
    @hide-modal="closeModal(TypeModals.DynamicForm)"
  >
    <div class="p-4 h-full w-full overflow-y-scroll">
      <div
        v-if="!formFields && !dynamicForm"
        class="h-full w-full flex justify-center items-center"
      >
        <spinner-loader />
      </div>
      <div
        v-else
        v-for="(field, index) in formFields"
        :key="index"
        class="w-full pb-2"
      >
        <metadata-wrapper
          v-if="field.__typename === 'PanelMetaData'"
          :form-id="dynamicFormQuery"
          :metadata="field"
          :is-edit="true"
          @has-error="setFormContainsErrors"
        />
        <upload-interface-dropzone
          v-if="field.__typename === 'UploadField'"
          :dropzone-label="field.label"
          :accepted-file-types="field.inputField.fileTypes"
          :max-file-size="field.inputField.maxFileSize"
          :dropzone-size="field.uploadFieldSize"
          :max-amount-of-files="field.inputField.maxAmountOfFiles"
          :dry-run="field.dryRunUpload"
          :upload-field-type="field.uploadFieldType"
        />
        <BaseButtonNew
          v-if="field.__typename === 'FormAction'"
          :label="t(field.label)"
          :icon="field.icon"
          button-style="accentAccent"
          :disabled="
            field.actionType === ActionType.Upload
              ? !enableUploadButton
              : formContainsErrors
          "
          @click="performActionButtonClickEvent(field)"
        />
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from "@/components/base/BaseModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import {
  ActionType,
  FormAction,
  PanelMetaData,
  TypeModals,
  UploadField,
} from "@/generated-types/queries";
import { useImport } from "@/composables/useImport";
import { useDynamicFormModal } from "@/components/dynamicForms/useDynamicFormModal";
import { computed, inject, ref, watch } from "vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import UploadInterfaceDropzone from "@/components/UploadInterfaceDropzone.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { useI18n } from "vue-i18n";
import useUpload from "@/composables/useUpload";

const dynamicFormQuery = computed(
  (): string | undefined =>
    getModalInfo(TypeModals.DynamicForm).formQuery || undefined,
);
const { setQueryName, loadDocument } = useImport();
const { closeModal, getModalInfo } = useBaseModal();
const { getDynamicForm, dynamicForm } = useDynamicFormModal();
const { upload, enableUploadButton, mediafiles } = useUpload();
const config = inject("config");
const formFields = computed<UploadField | PanelMetaData | undefined>(() => {
  if (!dynamicForm.value || !dynamicForm.value[dynamicFormQuery.value])
    return undefined;
  return Object.values(
    dynamicForm.value[dynamicFormQuery.value].formFields,
  ).filter((value) => typeof value === "object");
});
const formFieldErrorStatus = ref<Object[]>([]);
const formContainsErrors = computed(() =>
  formFieldErrorStatus.value.some(
    (errorObject) => errorObject.hasError === true,
  ),
);
const { t } = useI18n();

const setFormContainsErrors = (containsErrors: Object) => {
  if (
    !formFieldErrorStatus.value.some(
      (errorObject: Object) => errorObject === containsErrors,
    )
  ) {
    formFieldErrorStatus.value = formFieldErrorStatus.value.filter(
      (errorStatus) => errorStatus.key !== containsErrors.key,
    );
    formFieldErrorStatus.value.push(containsErrors);
  }
};

const performActionButtonClickEvent = (field: FormAction): void => {
  if (field.actionType === ActionType.Upload) {
    upload(false, config, t);
    return;
  }
  if (field.actionType === ActionType.Submit) {
    console.log("Submit");
  }
};

const getFormQuery = async () => {
  setQueryName(dynamicFormQuery.value);
  return await loadDocument();
};

watch(
  () => dynamicFormQuery.value,
  async () => {
    if (!dynamicFormQuery.value) return;
    const document = await getFormQuery();
    getDynamicForm(document);
  },
);
</script>

<style scoped></style>
