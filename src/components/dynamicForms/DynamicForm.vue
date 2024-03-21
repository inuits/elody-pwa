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
          @update:field="setFormFieldState"
          @update:relations="setRelationFormFieldState"
        />
        <upload-interface-dropzone
          v-if="field.__typename === 'UploadField'"
          :dropzone-label="field.label"
          :validation="field.inputField?.validation?.value"
          :accepted-file-types="field.inputField?.fileTypes"
          :max-file-size="field.inputField?.maxFileSize"
          :dropzone-size="field.uploadFieldSize"
          :max-amount-of-files="field.inputField?.maxAmountOfFiles"
          :upload-multiple="field.inputField?.uploadMultiple"
          :dry-run="field.dryRunUpload"
          :upload-field-type="field.uploadFieldType"
        />
        <DynamicFormUploadButton
          v-if="
            field.__typename === 'FormAction' &&
            field.actionType == ActionType.Upload
          "
          :label="t(field.label)"
          :icon="field.icon"
          :errors="uploadFileErrors"
          :disabled="!enableUploadButton"
          :progressIndicator="field?.actionProgressIndicator"
          @click="performActionButtonClickEvent(field)"
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
  PanelMetaData,
  TypeModals,
  UploadField,
  EditStatus,
  type RelationFieldInput,
} from "@/generated-types/queries";
import type { InBulkProcessableItem } from "@/composables/useBulkOperations";
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
    router: Router;
  }>(),
  {
    hasLinkedUpload: false,
  }
);

const config = inject("config");
const { currentTenant } = useApp();

const { loadDocument } = useImport();
const { closeModal, getModalInfo } = useBaseModal();
const { getDynamicForm, dynamicForm, performSubmitAction } = useDynamicForm();
const {
  upload,
  enableUploadButton,
  mediafiles,
  fileErrors,
  dryRunErrors,
  uploadProgress,
  resetUpload,
} = useUpload();
const formFields = computed<
  UploadField | PanelMetaData | FormAction | undefined
>(() => {
  if (!dynamicForm.value || !dynamicForm.value["GetDynamicForm"])
    return undefined;
  return Object.values(dynamicForm.value["GetDynamicForm"].formFields).filter(
    (value) => typeof value === "object"
  );
});
const formFieldsState = ref<Object[]>([]);
const formRelationsFieldsState = ref<RelationFieldInput[]>([]);
const formContainsErrors = computed((): boolean =>
  formFieldsState.value.some(
    (formFieldState: FormFieldState) =>
      formFieldState.errorMessage !== undefined
  )
);
const uploadFileErrors = computed((): string[] => [
  ...dryRunErrors.value,
  ...fileErrors.value.map((error) =>
    t(`upload-fields.errors.${error.error}`, [error.filename])
  ),
]);
const { t } = useI18n();

const setFormFieldState = (fieldValue: FormFieldState) => {
  formFieldsState.value = formFieldsState.value.filter(
    (formFieldState: FormFieldState) =>
      formFieldState.fieldKey !== fieldValue.fieldKey
  );
  formFieldsState.value.push(fieldValue);
};

const setRelationFormFieldState = (relations: {
  selectedItems: InBulkProcessableItem[];
  relationType: string;
}) => {
  const { selectedItems, relationType } = relations;
  const filteredOldRelations: RelationFieldInput[] = 
    formRelationsFieldsState.value.filter((field: RelationFieldInput) => field.type !== relationType);
  
  const newRelations: RelationFieldInput[] = [];
  selectedItems.forEach((item) => {
    newRelations.push({
      key: item.id,
      type: relationType,
      editStatus: EditStatus.New,
      value: item.value,
    });
  });

  formRelationsFieldsState.value = [...filteredOldRelations, ...newRelations];
};

const createEntityFromFormInput = (entityType: Entitytyping): EntityInput => {
  let entity: EntityInput = { type: entityType };
  entity.metadata = formFieldsState.value.map(
    (formFieldState: FormFieldState) => {
      return {
        key: formFieldState.fieldKey,
        value: formFieldState.value,
      };
    }
  );
  entity.relations = formRelationsFieldsState.value;
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
    const document = await getQuery(field.actionQuery);
    const entityInput = createEntityFromFormInput(field.creationType);
    const entity = (await performSubmitAction(document, entityInput)).data
      .CreateEntity;
    closeModal(TypeModals.DynamicForm);
    goToEntityPage(entity, "SingleEntity", props.router);
  }
};

const getFormProgressIndicator = (): ActionProgress | undefined => {
  if (!formFields.value) return undefined;
  const actionButton: FormAction = formFields.value.find(
    (formField: any) => formField.__typename === "FormAction"
  );
  if (!actionButton) return undefined;
  return actionButton.actionProgressIndicator;
};

const getUploadProgressSteps = (
  progressIndicator: ActionProgress
): ActionProgressStep[] => {
  if (progressIndicator.type === ActionProgressIndicatorType.Spinner) return [];

  return Object.values(progressIndicator).filter(
    (value: any) =>
      typeof value === "object" && value.__typename === "ActionProgressStep"
  );
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
