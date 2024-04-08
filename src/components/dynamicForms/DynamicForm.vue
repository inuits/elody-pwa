<template>
  <div class="p-4 h-full w-full overflow-y-scroll">
    <div
      v-if="!formFields && !dynamicForm"
      class="h-full w-full flex justify-center items-center"
    >
      <spinner-loader />
    </div>
    <div v-else class="w-full">
      <h1 v-if="dynamicForm.GetDynamicForm.label" class="title pb-4">
        {{ t(dynamicForm.GetDynamicForm.label) }}
      </h1>
      <div
        v-for="(field, index) in formFields"
        :key="`${dynamicFormQuery}_field_${index}`"
        class="pb-2"
      >
        <metadata-wrapper
          v-if="field.__typename === 'PanelMetaData'"
          :form-id="dynamicFormQuery"
          :metadata="field"
          :is-edit="true"
          form-flow="create"
        />
        <div v-if="field.__typename === 'UploadContainer'">
          <upload-interface-dropzone
            v-for="uploadField in Object.values(field as UploadField).filter((uploadContainerField) => typeof uploadContainerField === 'object')"
            :upload-flow="(field as UploadContainer).uploadFlow"
            :dropzone-label="(uploadField as UploadField).label"
            :validation="(uploadField as UploadField).inputField.validation?.value"
            :accepted-file-types="(uploadField as UploadField).inputField.fileTypes"
            :max-file-size="(uploadField as UploadField).inputField.maxFileSize"
            :dropzone-size="(uploadField as UploadField).uploadFieldSize"
            :max-amount-of-files="(uploadField as UploadField).inputField.maxAmountOfFiles"
            :upload-multiple="(uploadField as UploadField).inputField.uploadMultiple"
            :dry-run="(uploadField as UploadField).dryRunUpload"
            :upload-field-type="(uploadField as UploadField).uploadFieldType"
          />
        </div>

        <DynamicFormUploadButton
          v-if="
            field.__typename === 'FormAction' &&
            (field as FormAction).actionType == ActionType.Upload
          "
          :label="t((field as FormAction).label)"
          :icon="(field as FormAction).icon"
          :disabled="!enableUploadButton"
          :progressIndicatorType="(field as FormAction).actionProgressIndicator.type"
          @click-upload-button="
            performActionButtonClickEvent(field as FormAction)
          "
          @reset-upload="initializeForm"
        />
        <BaseButtonNew
          v-if="
            field.__typename === 'FormAction' &&
            field.actionType == ActionType.Submit
          "
          class="mt-5 mb-10"
          :label="
            config?.features.hasTenantSelect
              ? `${t(field.label)} ${t(`types.${field.creationType}`)}${
                  config.tenantDefiningTypes !== field.creationType
                    ? ` in ${t(
                        `navigation.tenant`
                      ).toLowerCase()} ${currentTenant}`
                    : ''
                }`
              : t(field.label)
          "
          :icon="field.icon"
          :disabled="formContainsErrors"
          button-style="accentAccent"
          @click="performActionButtonClickEvent(field)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBaseModal } from "@/composables/useBaseModal";
import {
  ActionProgress,
  ActionProgressIndicatorType,
  ActionProgressStep,
  ActionType,
  EntityInput,
  Entitytyping,
  FormAction,
  type MetadataInput,
  PanelMetaData,
  TypeModals,
  type UploadContainer,
  UploadField,
} from "@/generated-types/queries";
import { useImport } from "@/composables/useImport";
import { useDynamicForm } from "@/components/dynamicForms/useDynamicForm";
import { computed, inject, ref, watch } from "vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import UploadInterfaceDropzone from "@/components/UploadInterfaceDropzone.vue";
import { useI18n } from "vue-i18n";
import useUpload from "@/composables/useUpload";
import { goToEntityPage } from "@/helpers";
import type { Router } from "vue-router";
import DynamicFormUploadButton from "@/components/dynamicForms/DynamicFormUploadButton.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { useApp } from "@/composables/useApp";
import type { FormContext } from "vee-validate";
import { useFormHelper } from "@/composables/useFormHelper";

const props = withDefaults(
  defineProps<{
    dynamicFormQuery: string;
    hasLinkedUpload?: boolean;
    router: Router;
  }>(),
  {
    hasLinkedUpload: false,
  }
);

const config = inject("config");
const { currentTenant } = useApp();

const { createForm, deleteForm } = useFormHelper();
const { loadDocument } = useImport();
const { closeModal, getModalInfo } = useBaseModal();
const { getDynamicForm, dynamicForm, performSubmitAction } = useDynamicForm();
const { upload, enableUploadButton, mediafiles, uploadProgress, resetUpload } =
  useUpload();
const formFields = computed<
  UploadField | PanelMetaData | FormAction | undefined
>(() => {
  if (!dynamicForm.value || !dynamicForm.value["GetDynamicForm"])
    return undefined;
  return Object.values(dynamicForm.value["GetDynamicForm"].formFields).filter(
    (value) => typeof value === "object"
  );
});
const form = ref<FormContext<any>>();
const formContainsErrors = computed((): boolean => !form.value?.meta.valid);
const uploadFileErrors = computed((): string[] => [
  ...dryRunErrors.value,
  ...fileErrors.value.map((error) =>
    t(`upload-fields.errors.${error.error}`, [error.filename])
  ),
]);
const { t } = useI18n();

const createEntityFromFormInput = (entityType: Entitytyping): EntityInput => {
  let entity: EntityInput = { type: entityType };
  entity.metadata = Object.keys(form.value?.values.intialValues)
    .map((key) => {
      return { key, value: form.value?.values.intialValues[key] };
    })
    .filter((metadataItem: MetadataInput) => metadataItem.value);
  entity.relations = form.value?.values.relationValues.relations;
  return entity;
};

const getQuery = async (queryName: string) => {
  return await loadDocument(queryName);
};

const performActionButtonClickEvent = async (
  field: FormAction
): Promise<void> => {
  if (field.actionType === ActionType.Upload) {
    if (!enableUploadButton.value) return;
    upload(props.hasLinkedUpload, config, t);
    return;
  }
  if (field.actionType === ActionType.Submit) {
    if (formContainsErrors.value) return;
    const document = await getQuery(field.actionQuery as string);
    const entityInput = createEntityFromFormInput(field.creationType);
    const entity = (await performSubmitAction(document, entityInput)).data
      .CreateEntity;
    closeModal(TypeModals.DynamicForm);
    deleteForm(props.dynamicFormQuery);
    goToEntityPage(entity, "SingleEntity", props.router);
  }
};

const getFormProgressIndicator = (): ActionProgress | undefined => {
  if (!formFields.value) return undefined;
  const actionButton: FormAction = formFields.value.find(
    (formField: any) => formField.__typename === "FormAction"
  );
  if (!actionButton) return undefined;
  return actionButton.actionProgressIndicator || undefined;
};

const getUploadProgressSteps = (
  progressIndicator: ActionProgress
): ActionProgressStep[] => {
  if (progressIndicator.type === ActionProgressIndicatorType.Spinner) return [];

  return Object.values(progressIndicator).filter(
    (value: any) =>
      typeof value === "object" && value.__typename === "ActionProgressStep"
  ) as ActionProgressStep[];
};

const initializeForm = async () => {
  resetUpload();
  if (!props.dynamicFormQuery) return;
  const document = await getQuery(props.dynamicFormQuery);
  getDynamicForm(document);
};

watch(
  () => props.dynamicFormQuery,
  async () => {
    deleteForm(props.dynamicFormQuery);
    if (!form.value)
      form.value = createForm(props.dynamicFormQuery, {
        intialValues: {},
        relationValues: {},
      } as {
        [key: string]: object;
      });
    await initializeForm();
  },
  { immediate: true }
);

watch(
  () => formFields.value,
  () => {
    const progressIndicator = getFormProgressIndicator();
    if (progressIndicator)
      uploadProgress.value = getUploadProgressSteps(progressIndicator);
  },
  { immediate: true }
);
</script>

<style scoped></style>
