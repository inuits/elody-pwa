<template>
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
        @update:field="setFormFieldState"
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
        :errors="uploadFileErrors"
        :disabled="
          field.actionType === ActionType.Upload
            ? !enableUploadButton
            : formContainsErrors
        "
        @click="performActionButtonClickEvent(field)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBaseModal } from "@/composables/useBaseModal";
import {
  ActionType,
  EntityInput,
  Entitytyping,
  FormAction,
  PanelMetaData,
  TypeModals,
  UploadField,
  UploadFieldType,
} from "@/generated-types/queries";
import { useImport } from "@/composables/useImport";
import { useDynamicFormModal } from "@/components/dynamicForms/useDynamicFormModal";
import { computed, inject, ref, watch, onMounted } from "vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import UploadInterfaceDropzone from "@/components/UploadInterfaceDropzone.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { useI18n } from "vue-i18n";
import useUpload from "@/composables/useUpload";

type FormFieldState = {
  fieldKey: string;
  errorMessage: string;
  meta: object;
  value: any;
};

const props = withDefaults(
  defineProps<{
    dynamicFormQuery: string;
    hasLinkedUpload?: boolean;
  }>(),
  {
    hasLinkedUpload: false,
  },
);

const { setQueryName, loadDocument } = useImport();
const { closeModal, getModalInfo } = useBaseModal();
const { getDynamicForm, dynamicForm, performSubmitAction } =
  useDynamicFormModal();
const { upload, enableUploadButton, mediafiles, fileErrors, dryRunErrors } =
  useUpload();
const config = inject("config");
const formFields = computed<UploadField | PanelMetaData | undefined>(() => {
  if (!dynamicForm.value || !dynamicForm.value["GetDynamicForm"])
    return undefined;
  return Object.values(dynamicForm.value["GetDynamicForm"].formFields).filter(
    (value) => typeof value === "object",
  );
});
const formFieldsState = ref<Object[]>([]);
const formContainsErrors = computed((): boolean =>
  formFieldsState.value.some(
    (formFieldState: FormFieldState) =>
      formFieldState.errorMessage !== undefined,
  ),
);
const uploadFileErrors = computed((): string[] => [
  ...dryRunErrors.value,
  ...fileErrors.value.map((error) =>
    t(`upload-fields.errors.${error.error}`, [error.filename]),
  ),
]);
const { t } = useI18n();

const setFormFieldState = (fieldValue: FormFieldState) => {
  formFieldsState.value = formFieldsState.value.filter(
    (formFieldState: FormFieldState) =>
      formFieldState.fieldKey !== fieldValue.fieldKey,
  );
  formFieldsState.value.push(fieldValue);
};

const createEntityFromFormInput = (entityType: Entitytyping): EntityInput => {
  let entity: EntityInput = { type: entityType };
  entity.metadata = formFieldsState.value.map(
    (formFieldState: FormFieldState) => {
      return {
        key: formFieldState.fieldKey,
        value: formFieldState.value,
      };
    },
  );
  return entity;
};

const getQuery = async (queryName: string) => {
  setQueryName(queryName);
  return await loadDocument();
};

const performActionButtonClickEvent = async (
  field: FormAction,
): Promise<void> => {
  if (field.actionType === ActionType.Upload) {
    upload(props.hasLinkedUpload, config, t);
    return;
  }
  if (field.actionType === ActionType.Submit) {
    const document = await getQuery(field.actionQuery);
    const entity = createEntityFromFormInput(field.creationType);
    performSubmitAction(document, entity);
    closeModal(TypeModals.DynamicForm);
  }
};

const initializeForm = async () => {
  if (!props.dynamicFormQuery) return;
  const document = await getQuery(props.dynamicFormQuery);
  getDynamicForm(document);
};

onMounted(() => {
  initializeForm();
});

watch(
  () => props.dynamicFormQuery,
  async () => {
    initializeForm();
  },
);
</script>

<style scoped></style>
