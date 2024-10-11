<template>
  <div
    data-cy="dynamic-form"
    class="p-4 pt-0 h-full w-full overflow-y-auto"
    :key="dynamicFormQuery"
  >
    <div v-if="!isLoading" class="w-full [&>*>button:last-child]:mb-0">
      <h1 v-if="dynamicForm.GetDynamicForm.label" class="title pb-4">
        {{ t(dynamicForm.GetDynamicForm.label) }}
      </h1>
      <p v-if="dynamicForm.GetDynamicForm.infoLabel" class="text-sm text-text-body pb-4">
        {{ t(dynamicForm.GetDynamicForm.infoLabel) }}
      </p>
      <div
        v-for="(field, index) in getFieldArray"
        :key="`${dynamicFormQuery}_field_${index}`"
        class="pb-2"
      >
        <ImportComponent
          v-if="
            field.inputField?.type === BaseFieldType.BaseFileSystemImportField
          "
          :close-and-delete-form="closeAndDeleteForm"
        />
        <EntityPickerComponent
          v-if="field.inputField?.type === BaseFieldType.BaseEntityPickerField"
          :enable-bulk-operations="true"
          :entity-uuid="getEntityUuid()"
          :parent-entity-type="getParentEntityType()"
          :custom-filters-query="getCustomGetEntitiesFiltersQuery()"
          :accepted-types="getAcceptedTypes()"
          :custom-query="getCustomGetEntitiesQuery()"
          :entity-picker-mode="EntityPickerMode.Save"
          :show-button="true"
          :enable-advanced-filters="true"
        />
        <metadata-wrapper
          v-if="
            field.__typename === 'PanelMetaData' &&
            !nonStandardFieldTypes.includes(field.inputField.type)
          "
          :form-id="dynamicFormQuery"
          :metadata="field as PanelMetaData"
          :is-edit="true"
          form-flow="create"
          :show-errors="showErrors"
          :key="`${dynamicFormQuery}_field_${index}`"
        />
        <div v-if="field.__typename === 'UploadContainer'">
          <div
            v-for="(uploadContainerField, idx) in Object.values(field as any).filter(
              (containerField) => typeof containerField === 'object'
            )"
            :key="idx"
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
                :entity-types-for-upload="(uploadContainerField as UploadField).entityTypesForUpload"
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
        <div
          v-if="
            (isButtonDisabled ||
              (field.actionType === ActionType.Upload &&
                !enableUploadButton)) &&
            field.__typename === 'FormAction'
          "
          class="h-auto mt-5"
        >
          <div
            :title="t(`tooltip.buttons.disabled-${field.actionType}-button`)"
          >
            <unicon :name="Unicons.QuestionCircle.name" height="20" />
          </div>
        </div>
        <DynamicFormUploadButton
          v-if="
            field.__typename === 'FormAction' &&
            (field as FormAction).actionType == ActionType.Upload ||
            (field as FormAction).actionType == ActionType.UploadCsvForReordening ||
            (field as FormAction).actionType == ActionType.UpdateMetadata
          "
          :label="t((field as FormAction).label)"
          :icon="(field as FormAction).icon"
          :disabled="!enableUploadButton"
          :progressIndicatorType="(field as FormAction).actionProgressIndicator?.type"
          @click-upload-button="
            performActionButtonClickEvent(field as FormAction)
          "
          @reset-upload="initializeForm"
        />
        <BaseButtonNew
          v-if="
            field.__typename === 'FormAction' &&
            field.actionType !== ActionType.Upload &&
            field.actionType !== ActionType.UploadCsvForReordening &&
            field.actionType !== ActionType.UpdateMetadata
          "
          :class="[
            { 'mt-5 mb-10': !isButtonDisabled },
            { 'mt-0': isButtonDisabled },
          ]"
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
          :disabled="isButtonDisabled"
          :icon="field.icon"
          button-style="accentAccent"
          @click="performActionButtonClickEvent(field)"
        />
        <p
          v-if="submitErrors && index === getFieldArray.length - 1"
          class="text-red-default"
        >
          {{ submitErrors }}
        </p>
      </div>
    </div>
    <div v-else class="min-h-[20rem] w-full flex justify-center items-center">
      <spinner-loader theme="accent" />
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
  BaseFieldType,
  type BaseRelationValuesInput,
  BulkOperationTypes,
  EditStatus,
  EndpointResponseActions,
  type EntityInput,
  EntityPickerMode,
  Entitytyping,
  type FormAction,
  type MetadataInput,
  MutateEntityValuesDocument,
  type MutateEntityValuesMutation,
  type MutateEntityValuesMutationVariables,
  OcrType,
  type PanelMetaData,
  TypeModals,
  type UploadContainer,
  type UploadField,
  UploadFlow,
  RouteNames,
} from "@/generated-types/queries";
import { useImport } from "@/composables/useImport";
import { useDynamicForm } from "@/components/dynamicForms/useDynamicForm";
import { computed, inject, ref, watch } from "vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import UploadInterfaceDropzone from "@/components/UploadInterfaceDropzone.vue";
import { useI18n } from "vue-i18n";
import useUpload from "@/composables/useUpload";
import {
  calculateFutureDate,
  goToEntityPage,
  goToEntityTypeRoute,
} from "@/helpers";
import type { Router } from "vue-router";
import DynamicFormUploadButton from "@/components/dynamicForms/DynamicFormUploadButton.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { useApp } from "@/composables/useApp";
import { type FormContext, useForm } from "vee-validate";
import { useFormHelper } from "@/composables/useFormHelper";
import {
  NotificationType,
  useNotification,
} from "@/components/base/BaseNotification.vue";
import useMenuHelper from "@/composables/useMenuHelper";
import ImportComponent from "@/components/ImportComponent.vue";
import useTenant from "@/composables/useTenant";
import { apolloClient } from "@/main";
import { useMutation } from "@vue/apollo-composable";
import type { ApolloClient } from "@apollo/client/core";
import { Unicons } from "@/types";
import BaseTooltip from "@/components/base/BaseTooltip.vue";
import EntityPickerComponent from "@/components/EntityPickerComponent.vue";
import useEntityPickerModal from "@/composables/useEntityPickerModal";

const props = withDefaults(
  defineProps<{
    dynamicFormQuery: string;
    savedContext?: any | undefined;
    router: Router;
    modalFormFields?: object;
    tabName?: string;
  }>(),
  {
    modalFormFields: undefined,
  }
);

const emit = defineEmits(["entityCreated"]);

type FormFieldTypes = UploadContainer | PanelMetaData | FormAction;
const nonStandardFieldTypes: BaseFieldType[] = [
  BaseFieldType.BaseFileSystemImportField,
  BaseFieldType.BaseEntityPickerField,
];

const modalFormFields = props.modalFormFields;
const config: any = inject("config");
const { getTenants } = useTenant(apolloClient as ApolloClient<any>, config);
const { currentTenant } = useApp();
const {
  createForm,
  deleteForm,
  parseRelationValuesForFormSubmit,
  parseIntialValuesForFormSubmit,
  addEditableMetadataKeys,
} = useFormHelper();
const { createNotificationOverwrite } = useNotification();
const { loadDocument } = useImport();
const { closeModal } = useBaseModal();
const {
  getDynamicForm,
  dynamicForm: dynamicFormValue,
  getDynamicFormTabs,
  performSubmitAction,
  performDownloadAction,
  performUpdateMetadataAction,
  performOcrAction,
  resetDynamicForm,
  isPerformingAction,
} = useDynamicForm();
const {
  upload,
  enableUploadButton,
  uploadProgress,
  standaloneFileType,
  reinitializeDynamicFormFunc,
  uploadCsvForReordering,
  __handleHttpError,
  __getCsvString,
  resetUpload,
} = useUpload();
const {
  getAcceptedTypes,
  getParentEntityType,
  getEntityUuid,
  getCustomGetEntitiesFiltersQuery,
  getCustomGetEntitiesQuery,
} = useEntityPickerModal();

const { mutate } = useMutation<
  MutateEntityValuesMutation,
  MutateEntityValuesMutationVariables
>(MutateEntityValuesDocument);

const dynamicForm = computed(() => {
  return props.tabName
    ? getDynamicFormTabs(props.tabName)
    : dynamicFormValue.value;
});

const { resetForm } = useForm();
interface FormObject {
  __typename: string;
}

const findFormTabObjects = (
  dynamicForm: Record<string, FormObject>
): FormObject[] => {
  if (!dynamicForm) {
    return [];
  }

  return Object.values(dynamicForm).filter(
    (value) => value && value.__typename === "FormTab"
  );
};

const formTabs = computed(() => {
  return dynamicForm.value?.GetDynamicForm;
});

const formFields = computed<FormFieldTypes[] | undefined>(() => {
  const formTabsValue = formTabs.value;
  if (!formTabsValue) return undefined;

  const normalizeFields = (formFields: FormObject[]) => {
    return formFields.flatMap((formTab) =>
      Object.values(formTab.formFields).filter(
        (value) => typeof value === "object"
      )
    );
  };

  const formTabObjects = findFormTabObjects(formTabsValue);
  if (formTabObjects.length === 0 && !props.tabName)
    return normalizeFields([formTabsValue]);
  if (formTabObjects.length === 0) return undefined;

  return normalizeFields(formTabObjects);
});

const getFieldArray = computed(() => {
  return modalFormFields ? modalFormFields : formFields.value || [];
});

const form = ref<FormContext<any>>();
const formContainsErrors = computed((): boolean => !form.value?.meta.valid);
const showErrors = ref<boolean>(false);
const isButtonDisabled = computed((): boolean =>
  showErrors.value ? formContainsErrors.value : false
);
const formClosing = ref<boolean>(false);
const submitErrors = ref<string | undefined>(undefined);
const { getMenuDestinations, changeExpandedState } = useMenuHelper();
const isLoading = computed(() => {
  if (isPerformingAction.value) return true;
  return !formFields.value && !dynamicForm.value;
});
const { t } = useI18n();
const isLinkedUpload = computed<boolean>(() => {
  const uploadContainer: UploadContainer | undefined = formFields.value?.find(
    (formField: any) => formField.__typename === "UploadContainer"
  ) as UploadContainer | undefined;
  if (!uploadContainer) return false;
  return uploadContainer.uploadFlow === UploadFlow.MediafilesOnly;
});

const createEntityFromFormInput = (entityType: Entitytyping): EntityInput => {
  let entity: EntityInput = { type: entityType };
  entity.metadata = Object.keys(form.value?.values.intialValues)
    .map((key) => {
      if (typeof form.value?.values.intialValues[key] === "boolean") {
        let bool = form.value?.values.intialValues[key] ? "true" : "false";
        return { key, value: bool };
      }
      if (key === "ttl") {
        return {
          key,
          value: calculateFutureDate(form.value?.values.intialValues[key]),
        };
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

const uploadActionFunction = async () => {
  if (!enableUploadButton.value) return;
  upload(isLinkedUpload.value, config, t);
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
  await form.value.validate();
  if (formContainsErrors.value) return;
  formClosing.value = true;
  const document = await getQuery(field.actionQuery as string);
  const entityInput = createEntityFromFormInput(field.creationType);
  let entity;
  try {
    entity = (await performSubmitAction(document, entityInput)).data
      .CreateEntity;
    showErrors.value = false;
    await getTenants();
    closeAndDeleteForm();
    if (props.savedContext?.callbackFunction)
      props.savedContext.callbackFunction();
    else goToEntityPage(entity, "SingleEntity", props.router);
  } catch (e) {
    isPerformingAction.value = false;
    submitErrors.value = e.message;
  }
};

const submitWithExtraMetadata = async (field: FormAction) => {
  await form.value.validate();
  if (formContainsErrors.value) return;
  formClosing.value = true;
  const document = await getQuery(field.actionQuery as string);
  const entityInput = createEntityFromFormInput(field.creationType);
  entityInput.metadata?.push(...props.savedContext);
  const entity = (await performSubmitAction(document, entityInput)).data
    .CreateEntity;
  emit("entityCreated", { ...entity, metadata: entityInput.metadata });
  createNotificationOverwrite(
    NotificationType.default,
    t("notifications.success.entityCreated.title"),
    t("notifications.success.entityCreated.description")
  );
  await getTenants();
  closeAndDeleteForm();
};

const downloadActionFunction = async (field: FormAction) => {
  try {
    await form.value.validate();
    if (formContainsErrors.value) return;
    formClosing.value = true;
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
    createNotificationOverwrite(
      NotificationType.default,
      t("notifications.success.downloadEntityCreated.title"),
      t("notifications.success.downloadEntityCreated.description")
    );
    await props.router.replace({ name: RouteNames.Downloads });
    closeAndDeleteForm();
  } catch (e) {
    submitErrors.value = e.message;
  }
};

const updateMetdataActionFunction = async (field: FormAction) => {
  await form.value.validate();
  if (formContainsErrors.value) return;
  formClosing.value = true;
  try {
    const document = await getQuery(field.actionQuery as string);
    let csv: string;
    await __getCsvString().then((csvResult) => {
      csv = csvResult;
    });
    await performUpdateMetadataAction(
      document,
      form.value.values.intialValues.type,
      csv
    );
    closeAndDeleteForm();
    createNotificationOverwrite(
      NotificationType.success,
      t("notifications.success.updataMetdataCsv.title"),
      t("notifications.success.updataMetdataCsv.description")
    );
  } catch (error) {
    resetUpload();
    __handleHttpError(error);
    submitErrors.value = error.message;
  }
};

const callEndpointInGraphql = async (field: FormAction) => {
  if (!field.endpointInformation) return;
  const endpoint = field.endpointInformation;
  const body = {};
  endpoint.variables.forEach((variable) => {
    body[variable] = props.savedContext[variable];
  });

  const result = await fetch(`${endpoint.endpointName}`, {
    headers: { "Content-Type": "application/json" },
    method: endpoint.method,
    body: JSON.stringify(body),
  });
  if (result.status !== 200) {
    const error = new Error(result.statusText);
    __handleHttpError(error);
    closeAndDeleteForm();
    submitErrors.value = error.message;
    throw error;
  }
  const data = await result.text();
  if (endpoint.responseAction === EndpointResponseActions.DownloadResponse)
    downloadDataFromResponse(data);
};

const reorderEntitiesWithCsvUpload = async () => {
  await form.value.validate();
  if (formContainsErrors.value) return;
  try {
    await uploadCsvForReordering(props.savedContext.parentId);
    closeAndDeleteForm();
    createNotificationOverwrite(
      NotificationType.success,
      t("notifications.success.csvReordering.title"),
      t("notifications.success.csvReordering.description")
    );
  } catch (error) {
    __handleHttpError(error);
    submitErrors.value = error.message;
  }
};

const startOcrActionFunction = async (field: FormAction) => {
  try {
    await form.value.validate();
    if (formContainsErrors.value) return;
    formClosing.value = true;
    const id = props.savedContext.parentId;
    addEditableMetadataKeys(Object.keys(form.value.values.intialValues), id);
    const metadata = parseIntialValuesForFormSubmit(
      form.value.values.intialValues,
      id
    );
    const relations = parseRelationValuesForFormSubmit(
      form.value.values.relationValues
    );
    await mutate({
      id: id,
      formInput: {
        metadata: metadata,
        relations: relations,
      },
      collection: props.savedContext.collection,
    }).then(() => {
      createNotificationOverwrite(
        NotificationType.default,
        t("notifications.success.entityUpdated.title"),
        t("notifications.success.entityUpdated.description")
      );
    });
    if (form.value.values.intialValues.ocr_type === OcrType.ManualUpload)
      return;

    const document = await getQuery(field.actionQuery as string);
    await performOcrAction(
      document,
      props.savedContext,
      form.value.values
    ).then(() => {
      createNotificationOverwrite(
        NotificationType.default,
        t("notifications.default.generate-ocr.title"),
        t("notifications.default.generate-ocr.description")
      );
    });
    closeAndDeleteForm();
  } catch (e) {
    submitErrors.value = e.message;
  }
};

const performActionButtonClickEvent = (field: FormAction): void => {
  useBaseModal().changeCloseConfirmation(TypeModals.DynamicForm, false);
  const actionFunctions: { [key: string]: Function } = {
    submit: () => submitActionFunction(field),
    updateMetadata: () => updateMetdataActionFunction(field),
    upload: () => uploadActionFunction(field),
    download: () => downloadActionFunction(field),
    ocr: () => startOcrActionFunction(field),
    endpoint: () => callEndpointInGraphql(field),
    uploadCsvForReordening: () => reorderEntitiesWithCsvUpload(),
    submitWithExtraMetadata: () => submitWithExtraMetadata(field),
  };
  if (!field.actionType) return;
  showErrors.value = true;
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
    if (props.savedContext.type === BulkOperationTypes.DownloadMediafiles) {
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
    if (
      props.savedContext.type === BulkOperationTypes.CreateEntity &&
      props.savedContext.parentId !== undefined
    ) {
      relations.push({
        key: props.savedContext.parentId,
        type: props.savedContext.relationType,
        editStatus: EditStatus.New,
      });
    }
  }

  resetVeeValidateForDynamicForm(newQueryName, oldQueryName, relations);
  if (!props.dynamicFormQuery) return;
  const document = await getQuery(props.dynamicFormQuery);
  getDynamicForm(document, props.tabName);
};

const closeAndDeleteForm = () => {
  closeModal(TypeModals.DynamicForm);
  changeExpandedState(false);
  deleteForm(props.dynamicFormQuery);
};

const downloadDataFromResponse = (data: any) => {
  let blob = new Blob([data], { type: "text/csv" });
  let url = window.URL.createObjectURL(blob);
  let a = document.createElement("a");
  a.href = url;
  a.download = "data.csv";
  a.click();
  window.URL.revokeObjectURL(url);
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
    if (intialValues && intialValues.standaloneUploadType)
      standaloneFileType.value = intialValues.standaloneUploadType;
    useBaseModal().changeCloseConfirmation(
      TypeModals.DynamicForm,
      form.value?.meta.dirty && !formClosing.value
    );
  },
  { deep: true, immediate: true }
);
</script>

<style scoped></style>
