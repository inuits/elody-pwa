<template>
  <div class="p-4 pt-0 h-full w-full overflow-y-auto" :key="dynamicFormQuery">
    <div
      v-if="formFields && dynamicFormQuery"
      class="w-full [&>*>button:last-child]:mb-0"
    >
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
          :metadata="field as PanelMetaData"
          :is-edit="true"
          form-flow="create"
          :key="`${dynamicFormQuery}_field_${index}`"
        />
        <div v-if="field.__typename === 'UploadContainer'">
          <div
            v-for="uploadContainerField in Object.values(field as any).filter(
              (containerField) => typeof containerField === 'object'
            )"
          >
            <div class="pb-2">
              <upload-interface-dropzone
                v-if="uploadContainerField.__typename === 'UploadField'"
                :upload-flow="(field as UploadContainer).uploadFlow"
                :dropzone-label="(uploadContainerField as UploadField).label"
                :validation="(uploadContainerField as UploadField).inputField.validation?.value"
                :accepted-file-types="(uploadContainerField as UploadField).inputField.fileTypes"
                :max-file-size="(uploadContainerField as UploadField).inputField.maxFileSize"
                :dropzone-size="(uploadContainerField as UploadField).uploadFieldSize"
                :max-amount-of-files="(uploadContainerField as UploadField).inputField.maxAmountOfFiles"
                :upload-multiple="(uploadContainerField as UploadField).inputField.uploadMultiple"
                :dry-run="(uploadContainerField as UploadField).dryRunUpload"
                :upload-field-type="(uploadContainerField as UploadField).uploadFieldType"
              />
            </div>
            <div class="pb-4">
              <metadata-wrapper
                v-if="uploadContainerField.__typename === 'PanelMetaData'"
                :form-id="dynamicFormQuery"
                :metadata="uploadContainerField"
                :is-edit="true"
                form-flow="create"
                :key="`${dynamicFormQuery}_field_${index}`"
              />
            </div>
          </div>
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
        <BaseButtonNew
          v-if="
            field.__typename === 'FormAction' &&
            field.actionType == ActionType.Download
          "
          class="mt-5 mb-10"
          :label="t((field as FormAction).label)"
          :icon="field.icon"
          :disabled="formContainsErrors"
          button-style="accentAccent"
          @click="performActionButtonClickEvent(field)"
        />
        <BaseButtonNew
          v-if="
            field.__typename === 'FormAction' &&
            field.actionType == ActionType.Update
          "
          class="mt-5 mb-10"
          :label="t((field as FormAction).label)"
          :icon="field.icon"
          :disabled="formContainsErrors"
          button-style="accentAccent"
          @click="performActionButtonClickEvent(field)"
        />
      </div>
    </div>
    <div v-else class="h-screen w-full flex justify-center items-center">
      <spinner-loader />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBaseModal } from "@/composables/useBaseModal";
import {
  type ActionProgress,
  ActionProgressIndicatorType,
  type ActionProgressStep,
  ActionType,
  type BaseRelationValuesInput,
  EditStatus,
  type EntityInput,
  Entitytyping,
  type FormAction,
  type MetadataInput,
  type PanelMetaData,
  TypeModals,
  type UploadContainer,
  type UploadField,
} from "@/generated-types/queries";
import { useImport } from "@/composables/useImport";
import { useDynamicForm } from "@/components/dynamicForms/useDynamicForm";
import { computed, inject, ref, watch } from "vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import UploadInterfaceDropzone from "@/components/UploadInterfaceDropzone.vue";
import { useI18n } from "vue-i18n";
import useUpload from "@/composables/useUpload";
import { goToEntityPage, goToEntityTypeRoute } from "@/helpers";
import type { Router } from "vue-router";
import DynamicFormUploadButton from "@/components/dynamicForms/DynamicFormUploadButton.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { useApp } from "@/composables/useApp";
import { type FormContext, useForm } from "vee-validate";
import { useFormHelper } from "@/composables/useFormHelper";
import useMenuHelper from "@/composables/useMenuHelper";

const props = withDefaults(
  defineProps<{
    dynamicFormQuery: string;
    hasLinkedUpload?: boolean;
    savedContext?: any | undefined;
    router: Router;
  }>(),
  {
    hasLinkedUpload: false,
  }
);

type FormFieldTypes = UploadContainer | PanelMetaData | FormAction;

const config = inject("config");
const { currentTenant } = useApp();
const { createForm, deleteForm, parseRelationValuesForFormSubmit } =
  useFormHelper();
const { loadDocument } = useImport();
const { closeModal } = useBaseModal();
const {
  getDynamicForm,
  dynamicForm,
  performSubmitAction,
  performDownloadAction,
  resetDynamicForm,
} = useDynamicForm();
const {
  upload,
  enableUploadButton,
  uploadProgress,
  standaloneFileType,
  reinitializeDynamicFormFunc,
} = useUpload();
const { resetForm } = useForm();
const formFields = computed<FormFieldTypes[] | undefined>(() => {
  if (!dynamicForm.value || !dynamicForm.value["GetDynamicForm"])
    return undefined;
  return Object.values(dynamicForm.value["GetDynamicForm"].formFields).filter(
    (value) => typeof value === "object"
  );
});
const form = ref<FormContext<any>>();
const formContainsErrors = computed((): boolean => !form.value?.meta.valid);
const { getMenuDestinations } = useMenuHelper();
const { t } = useI18n();

const createEntityFromFormInput = (entityType: Entitytyping): EntityInput => {
  let entity: EntityInput = { type: entityType };
  entity.metadata = Object.keys(form.value?.values.intialValues)
    .map((key) => {
      if (typeof form.value?.values.intialValues[key] === "boolean") {
        let bool = form.value?.values.intialValues[key] ? "true" : "false";
        return { key, value: bool };
      }
      return { key, value: form.value?.values.intialValues[key] };
    })
    .filter((metadataItem: MetadataInput) => metadataItem.value);
  entity.relations = parseRelationValuesForFormSubmit(
    form.value?.values.relationValues
  );
  return entity;
};

const getQuery = async (queryName: string) => {
  return await loadDocument(queryName);
};

const uploadActionFunction = (field: FormAction) => {
  if (!enableUploadButton.value) return;
  upload(props.hasLinkedUpload, config, t);
  if (standaloneFileType.value)
    goToEntityTypeRoute(
      standaloneFileType.value,
      { key: "date_updated", asc: false },
      getMenuDestinations(),
      props.router
    );
  return;
};

const submitActionFunction = async (field: FormAction) => {
  if (formContainsErrors.value) return;
  const document = await getQuery(field.actionQuery as string);
  const entityInput = createEntityFromFormInput(field.creationType);
  const entity = (await performSubmitAction(document, entityInput)).data
    .CreateEntity;
  closeModal(TypeModals.DynamicForm);
  deleteForm(props.dynamicFormQuery);
  goToEntityPage(entity, "SingleEntity", props.router);
};

const downloadActionFunction = async (field: FormAction) => {
  if (formContainsErrors.value) return;
  const document = await getQuery(field.actionQuery as string);
  const entityInput = createEntityFromFormInput(field.creationType);
  const entity = (
    await performDownloadAction(
      document,
      props.savedContext,
      entityInput,
      form.value.values
    )
  ).data.DownloadItemsInZip;
  closeModal(TypeModals.DynamicForm);
  deleteForm(props.dynamicFormQuery);
  goToEntityPage(entity, "SingleEntity", props.router);
};

const updateMetdataActionFunction = async (field: FormAction) => {
  if (formContainsErrors.value) return;
  //TODO: put code here that calls graphql function to the bulk edit endpoint in the collection-api
};

const performActionButtonClickEvent = async (
  field: FormAction
): Promise<void> => {
  useBaseModal().changeCloseConfirmation(TypeModals.DynamicForm, false);
  const actionFunctions: { [key: string]: Function } = {
    upload: () => uploadActionFunction(field),
    submit: () => submitActionFunction(field),
    download: () => downloadActionFunction(field),
    update: () => updateMetdataActionFunction(field),
  };
  if (!field.actionType) return;

  actionFunctions[field.actionType]();
};

const getFormProgressIndicator = (): ActionProgress | undefined => {
  if (!formFields.value) return undefined;
  const actionButton: FormAction | undefined = formFields.value.find(
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

const resetVeeValidateForDynamicForm = (
  newQueryName: string,
  oldQueryName: string | undefined,
  relations: BaseRelationValuesInput[]
) => {
  resetForm();
  if (oldQueryName) deleteForm(oldQueryName);
  form.value = createForm(newQueryName, {
    intialValues: {},
    relationValues: { relations },
  } as {
    [key: string]: object;
  });
};

const initializeForm = async (
  newQueryName: string,
  oldQueryName: string | undefined
) => {
  const relations: BaseRelationValuesInput[] = [];
  if (props.savedContext) {
    props.savedContext.mediafiles.forEach((mediafile) => {
      relations.push({
        key: mediafile,
        type: props.savedContext.relationType,
        editStatus: EditStatus.New,
      });
    });
    props.savedContext.entities.forEach((entity) => {
      relations.push({
        key: entity,
        type: props.savedContext.relationType,
        editStatus: EditStatus.New,
      });
    });
  }
  resetVeeValidateForDynamicForm(newQueryName, oldQueryName, relations);
  if (!props.dynamicFormQuery) return;
  const document = await getQuery(props.dynamicFormQuery);
  getDynamicForm(document);
};

watch(
  () => props.dynamicFormQuery,
  async (newValue, oldValue) => {
    resetDynamicForm();
    reinitializeDynamicFormFunc.value = () =>
      initializeForm(newValue, oldValue);
    await initializeForm(newValue, oldValue);
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

watch(
  () => form.value?.values.intialValues,
  (intialValues: { [key: string]: any }) => {
    if (intialValues.standaloneUploadType)
      standaloneFileType.value = intialValues.standaloneUploadType;
    useBaseModal().changeCloseConfirmation(
      TypeModals.DynamicForm,
      form.value?.meta.dirty
    );
  },
  { deep: true, immediate: true }
);
</script>

<style scoped></style>
