<template>
  <div
    data-cy="dynamic-form"
    class="p-4 pt-0 h-full w-full overflow-y-auto"
    :key="dynamicFormQuery"
  >
    <div v-if="!dynamicFormLoaded" class="w-full">
      <DynamicFormSkeleton :formKey="dynamicFormQuery" />
    </div>
    <div
      v-else
      class="w-full [&>*>button:last-child]:mb-0"
      :class="[isLoading ? 'opacity-20' : 'opacity-100']"
    >
      <h1
        v-if="dynamicForm?.GetDynamicForm?.label && showFormTitle"
        class="title pb-4"
      >
        {{ t(dynamicForm.GetDynamicForm.label) }}
      </h1>
      <p
        v-if="dynamicForm?.GetDynamicForm?.infoLabel"
        class="text-sm text-text-body pb-4"
      >
        {{ t(dynamicForm.GetDynamicForm.infoLabel) }}
      </p>
      <div
        v-for="(field, index) in getFieldArray"
        :key="`${dynamicFormQuery}_field_${index}`"
        class="pb-2"
      >
        <ImportWrapper
          v-if="
            field.inputField?.type ===
              BaseFieldType.BaseFileSystemImportField ||
            field.inputField?.type ===
              BaseFieldType.BaseMagazineWithMetsImportField ||
            field.inputField?.type ===
              BaseFieldType.BaseMagazineWithCsvImportField
          "
          :form-id="dynamicFormQuery"
          :input-field-type="field.inputField?.type"
          :close-and-delete-form="closeAndDeleteForm"
          @set-show-errors="(value) => setShowErrors(value)"
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
          v-show="!field.hiddenField?.hidden"
          :form-id="dynamicFormQuery"
          :metadata="field as PanelMetaData"
          :is-edit="true"
          form-flow="create"
          :show-errors="showErrors"
          :key="`${dynamicFormQuery}_field_${index}`"
          :is-used-in-modal="true"
        />
        <div v-if="field.__typename === 'UploadContainer'">
          <div
            v-for="(uploadContainerField, idx) in Object.values(
              field as any,
            ).filter((containerField) => typeof containerField === 'object')"
            :key="idx"
          >
            <div
              v-if="uploadContainerField.__typename === 'UploadField'"
              class="pb-4"
            >
              <upload-interface-dropzone
                :upload-flow="(field as UploadContainer).uploadFlow"
                :dropzone-label="(uploadContainerField as UploadField).label"
                :validation="
                  (uploadContainerField as UploadField).inputField.validation
                    ?.value
                "
                :accepted-file-types="
                  (uploadContainerField as UploadField).inputField.fileTypes
                "
                :max-file-size="
                  (uploadContainerField as UploadField).inputField.maxFileSize
                "
                :dropzone-size="
                  (uploadContainerField as UploadField).uploadFieldSize
                "
                :max-amount-of-files="
                  (uploadContainerField as UploadField).inputField
                    .maxAmountOfFiles
                "
                :upload-multiple="
                  (uploadContainerField as UploadField).inputField
                    .uploadMultiple
                "
                :dry-run="(uploadContainerField as UploadField).dryRunUpload"
                :upload-field-type="
                  (uploadContainerField as UploadField).uploadFieldType
                "
                :template-csvs="
                  (uploadContainerField as UploadField).templateCsvs
                "
                :info-label-url="
                  (uploadContainerField as UploadField).infoLabelUrl
                "
                :extra-mediafile-type="
                  (uploadContainerField as UploadField).extraMediafileType
                "
              />
            </div>
            <div
              v-if="uploadContainerField.__typename === 'PanelMetaData'"
              class="pb-4"
            >
              <metadata-wrapper
                :form-id="dynamicFormQuery"
                :metadata="uploadContainerField"
                :is-edit="true"
                form-flow="create"
                :key="`${dynamicFormQuery}_field_${index}`"
                :is-used-in-modal="true"
              />
            </div>
          </div>
        </div>
        <DynamicFormUploadButton
          v-if="
            (field.__typename === 'FormAction' &&
              (field as FormAction).actionType == ActionType.Upload) ||
            (field as FormAction).actionType == ActionType.UploadWithOcr ||
            (field as FormAction).actionType ==
              ActionType.UploadCsvForReordening ||
            (field as FormAction).actionType == ActionType.UpdateMetadata ||
            (field as FormAction).actionType == ActionType.SubmitWithUpload
          "
          :label="t((field as FormAction).label)"
          :icon="(field as FormAction).icon"
          :disabled="!enableUploadButton || isButtonDisabled"
          :progressIndicatorType="
            (field as FormAction).actionProgressIndicator?.type
          "
          @click-upload-button="
            performActionButtonClickEvent(field as FormAction)
          "
          @reset-upload="initializeForm"
          @close-and-delete-form="closeAndDeleteForm"
        />
        <BaseButtonNew
          v-if="
            field.__typename === 'FormAction' &&
            field.actionType !== ActionType.Upload &&
            field.actionType !== ActionType.SubmitWithUpload &&
            field.actionType !== ActionType.UploadCsvForReordening &&
            field.actionType !== ActionType.UpdateMetadata &&
            field.actionType !== ActionType.UploadWithOcr
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
                        `navigation.tenant`,
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
  </div>
</template>

<script setup lang="ts">
import { useBaseModal } from "@/composables/useBaseModal";
import type {
  Entitytyping,
  ActionProgress,
  ActionProgressStep,
  Entity,
  BaseRelationValuesInput,
  EntityInput,
  FormAction,
  MetadataInput,
  MutateEntityValuesMutation,
  MutateEntityValuesMutationVariables,
  PanelMetaData,
  UploadContainer,
  UploadField,
} from "@/generated-types/queries";
import {
  ActionProgressIndicatorType,
  ActionType,
  BaseFieldType,
  EndpointResponseActions,
  EntityPickerMode,
  MutateEntityValuesDocument,
  OcrType,
  RouteNames,
  TypeModals,
  UploadFlow,
} from "@/generated-types/queries";
import { useImport } from "@/composables/useImport";
import { useDynamicForm } from "@/components/dynamicForms/useDynamicForm";
import { computed, inject, ref, watch, onUnmounted } from "vue";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import UploadInterfaceDropzone from "@/components/UploadInterfaceDropzone.vue";
import { useI18n } from "vue-i18n";
import useUpload from "@/composables/useUpload";
import {
  calculateFutureDate,
  goToEntityPage,
  goToEntityPageById,
  extractTitleKeyFromMetadataFilter,
} from "@/helpers";
import { type Router, useRoute } from "vue-router";
import DynamicFormUploadButton from "@/components/dynamicForms/DynamicFormUploadButton.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { useApp } from "@/composables/useApp";
import { type FormContext, useForm } from "vee-validate";
import { useFormHelper } from "@/composables/useFormHelper";
import { useBaseNotification } from "@/composables/useBaseNotification";
import useMenuHelper from "@/composables/useMenuHelper";
import useTenant from "@/composables/useTenant";
import { apolloClient } from "@/main";
import { useMutation } from "@vue/apollo-composable";
import { type ApolloClient, ApolloError } from "@apollo/client/core";
import EntityPickerComponent from "@/components/EntityPickerComponent.vue";
import useEntityPickerModal from "@/composables/useEntityPickerModal";
import { useModalActions } from "@/composables/useModalActions";
import { useErrorCodes } from "@/composables/useErrorCodes";
import ImportWrapper from "@/components/imports/ImportWrapper.vue";
import useEntitySingle from "@/composables/useEntitySingle";
import {
  getExtensionConfigurationForEntity,
  tagEntity,
} from "@/components/entityElements/WYSIWYG/extensions/elodyTagEntityExtension/ElodyTaggingExtension";
import { BulkOperationsContextEnum } from "@/composables/useBulkOperations";
import DynamicFormSkeleton from "./DynamicFormSkeleton.vue";

const props = withDefaults(
  defineProps<{
    dynamicFormQuery: string;
    router: Router;
    modalFormFields?: object;
    tabName?: string;
    showFormTitle?: boolean;
    prefilledFormValues?: object;
  }>(),
  {
    modalFormFields: undefined,
    showFormTitle: true,
  },
);

const emit = defineEmits(["entityCreated", "dynamicFormReady"]);

type FormFieldTypes = UploadContainer | PanelMetaData | FormAction;
const nonStandardFieldTypes: BaseFieldType[] = [
  BaseFieldType.BaseFileSystemImportField,
  BaseFieldType.BaseEntityPickerField,
  BaseFieldType.BaseMagazineWithMetsImportField,
  BaseFieldType.BaseMagazineWithCsvImportField,
];

const modalFormFields = props.modalFormFields;
const config: any = inject("config");
const { getTenants } = useTenant(apolloClient as ApolloClient<any>, config);
const { currentTenant } = useApp();
const {
  createForm,
  deleteForm,
  parseRelationValuesForFormSubmit,
  parseInheritedRelationValuesFromFormSubmit,
  parseIntialValuesForFormSubmit,
  addEditableMetadataKeys,
} = useFormHelper();
const { displaySuccessNotification } = useBaseNotification();
const { loadDocument } = useImport();
const { closeModal, getModalInfo } = useBaseModal();
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
  dynamicFormLoaded,
} = useDynamicForm();
const {
  upload,
  enableUploadButton,
  uploadProgress,
  standaloneFileType,
  jobIdentifier,
  reinitializeDynamicFormFunc,
  uploadCsvForReordering,
  __getCsvString,
  resetUpload,
  mediafiles,
} = useUpload();
const {
  handleHttpError,
  getMessageAndCodeFromApolloError,
  getMessageAndCodeFromErrorString,
} = useErrorCodes();
const {
  getAcceptedTypes,
  getParentEntityType,
  getEntityUuid,
  getCustomGetEntitiesFiltersQuery,
  getCustomGetEntitiesQuery,
} = useEntityPickerModal();
const { extractActionArguments, getCallbackFunction } = useModalActions();
const route = useRoute();

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
  dynamicForm: Record<string, FormObject>,
): FormObject[] => {
  if (!dynamicForm) {
    return [];
  }

  return Object.values(dynamicForm).filter(
    (value) => value && value.__typename === "FormTab",
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
        (value) => typeof value === "object",
      ),
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
  showErrors.value ? formContainsErrors.value : false,
);
const formClosing = ref<boolean>(false);
const submitErrors = ref<string | undefined>(undefined);
const createdEntity = ref<Entity | null>(null);
const { changeExpandedState } = useMenuHelper();
const isLoading = computed(() => {
  if (isPerformingAction.value) return true;
  return !formFields.value && !dynamicForm.value;
});
const { t } = useI18n();
const isLinkedUpload = computed<boolean>(() => {
  const uploadContainer: UploadContainer | undefined = formFields.value?.find(
    (formField: any) => formField.__typename === "UploadContainer",
  ) as UploadContainer | undefined;
  if (!uploadContainer) return false;
  return (
    uploadContainer.uploadFlow === UploadFlow.MediafilesOnly ||
    uploadContainer.uploadFlow === UploadFlow.OptionalMediafiles
  );
});

const createEntityFromFormInput = async (
  entityType: Entitytyping,
  relations: BaseRelationValuesInput[] | undefined = undefined,
): Promise<EntityInput> => {
  let entity: EntityInput = { type: entityType };
  entity.metadata = Object.keys(form.value?.values.intialValues)
    .map((key) => {
      if (key === "ttl") {
        return {
          key,
          value: calculateFutureDate(form.value?.values.intialValues[key]),
        };
      }
      return { key, value: form.value?.values.intialValues[key] };
    })
    .filter((metadataItem: MetadataInput) => metadataItem.value);
  entity.relations = relations
    ? [
        ...relations,
        ...parseRelationValuesForFormSubmit(form.value?.values?.relationValues),
        ...(await parseInheritedRelationValuesFromFormSubmit(
          form.value?.values?.relationValues,
        )),
      ]
    : [
        ...parseRelationValuesForFormSubmit(form.value?.values.relationValues),
        ...(await parseInheritedRelationValuesFromFormSubmit(
          form.value?.values?.relationValues,
        )),
      ];
  return entity;
};

const getQuery = async (queryName: string) => {
  return await loadDocument(queryName);
};

const isFormValid = async () => {
  await form.value.validate();
  if (!formContainsErrors.value) formClosing.value = true;
  return !formContainsErrors.value;
};

const uploadActionFunction = async () => {
  if (!enableUploadButton.value) return;
  await upload(isLinkedUpload.value, config, t);
  if (jobIdentifier.value) {
    goToEntityPageById(
      jobIdentifier.value,
      { type: "job", __typename: "job" },
      "SingleEntity",
      props.router,
    );
  }
};

const tagNewlyCreatedEntity = (entity: Entity): void => {
  const parentId = route.params["id"];
  const { relationType, metadataFilterForTagContent } =
    getExtensionConfigurationForEntity(entity);
  const modalInfo = getModalInfo(TypeModals.ElodyEntityTaggingModal);
  const titleKey = extractTitleKeyFromMetadataFilter(
    metadataFilterForTagContent,
  );

  const newText = entity.intialValues[titleKey].toLowerCase();
  tagEntity(
    entity,
    relationType,
    parentId,
    BulkOperationsContextEnum.TagEntityModal,
  );
  modalInfo.editor.commands.linkEntityToTaggedText(
    entity,
    relationType,
    newText,
  );
};

const submitActionFunction = async (field: FormAction) => {
  if (!(await isFormValid())) return;
  const document = await getQuery(field.actionQuery as string);
  const entityInput = await createEntityFromFormInput(
    field.creationType,
    extractActionArguments(field.actionType), //Use this
  );
  let entity: Entity;
  try {
    entity = (await performSubmitAction(document, entityInput)).data
      .CreateEntity;
    showErrors.value = false;
    await getTenants();
    const callbackFunction: Function = extractActionArguments(field.actionType);
    if (config.features.hasBulkSelect && callbackFunction) callbackFunction();
    else {
      if (getModalInfo(TypeModals.ElodyEntityTaggingModal).open)
        tagNewlyCreatedEntity(entity);
      else
        setTimeout(
          () => goToEntityPage(entity, "SingleEntity", props.router),
          1,
        );
    }
    closeAndDeleteForm();
  } catch (e: ApolloError) {
    console.error(e);
    const errorObject = await getMessageAndCodeFromApolloError(e);
    isPerformingAction.value = false;
    submitErrors.value = errorObject.message;
  }
};

const submitWithUploadActionFunction = async (field: FormAction) => {
  if (!(await isFormValid())) return;
  const document = await getQuery(field.actionQuery as string);
  const entityInput = await createEntityFromFormInput(
    field.creationType,
    extractActionArguments(field.actionType),
  );
  let entity: any;
  try {
    if (!createdEntity.value) {
      entity = (await performSubmitAction(document, entityInput)).data
        .CreateEntity;
      createdEntity.value = entity;
    } else {
      entity = createdEntity.value;
    }
    submitErrors.value = undefined;

    if (mediafiles.value.length > 0) {
      useEntitySingle().setEntityUuid(entity.uuid || entity.id);
      await uploadActionFunction();
    }

    showErrors.value = false;
    await getTenants();
    const callbackFunction: Function = extractActionArguments(field.actionType);
    if (config.features.hasBulkSelect && callbackFunction) callbackFunction();
    else {
      useBaseModal().closeModal(TypeModals.DynamicForm);
      setTimeout(() => goToEntityPage(entity, "SingleEntity", props.router), 1);
    }
  } catch (error: ApolloError | any) {
    const errorObject =
      error instanceof ApolloError
        ? await getMessageAndCodeFromApolloError(error)
        : await getMessageAndCodeFromErrorString(
            error?.extensions?.response?.body,
          );

    isPerformingAction.value = false;
    submitErrors.value = errorObject.message;
  }
};

const submitWithExtraMetadataActionFunction = async (field: FormAction) => {
  if (!(await isFormValid())) return;
  const document = await getQuery(field.actionQuery as string);
  const entityInput = await createEntityFromFormInput(field.creationType);
  entityInput.metadata?.push(...extractActionArguments(field.actionType));
  const entity = (await performSubmitAction(document, entityInput)).data
    .CreateEntity;
  emit("entityCreated", { ...entity, metadata: entityInput.metadata });
  displaySuccessNotification(
    t("notifications.success.entityCreated.title"),
    t("notifications.success.entityCreated.description"),
  );
  await getTenants();
  closeAndDeleteForm();
};

const downloadActionFunction = async (field: FormAction) => {
  if (!(await isFormValid())) return;
  try {
    const variables = extractActionArguments(field.actionType);
    const document = await getQuery(field.actionQuery as string);
    const entityInput = await createEntityFromFormInput(
      field.creationType,
      variables.relations,
    );
    const entity = (
      await performDownloadAction(
        document,
        variables,
        entityInput,
        form.value.values,
      )
    ).data.DownloadItemsInZip;
    displaySuccessNotification(
      t("notifications.success.downloadEntityCreated.title"),
      t("notifications.success.downloadEntityCreated.description"),
    );
    await props.router.replace({ name: RouteNames.Downloads });
    closeAndDeleteForm();
  } catch (e) {
    submitErrors.value = e.message;
  }
};

const updateMetdataActionFunction = async (field: FormAction) => {
  if (!(await isFormValid())) return;
  try {
    const document = await getQuery(field.actionQuery as string);
    let csv: string;
    await __getCsvString().then((csvResult) => {
      csv = csvResult;
    });
    await performUpdateMetadataAction(
      document,
      form.value.values.intialValues.type,
      csv,
    );
    closeAndDeleteForm();
    displaySuccessNotification(
      t("notifications.success.updateMetadataCsv.title"),
      t("notifications.success.updateMetadataCsv.description"),
    );
  } catch (error: ApolloError) {
    const errorObject = await getMessageAndCodeFromApolloError(error);
    resetUpload();
    submitErrors.value = errorObject.message;
  }
};

const callEndpointActionFunction = async (field: FormAction) => {
  if (!field.endpointInformation) return;
  const endpoint = field.endpointInformation;
  const body = {};
  endpoint.variables.forEach((variable) => {
    body[variable] = extractActionArguments(field.actionType)[variable];
  });

  const result = await fetch(`${endpoint.endpointName}`, {
    headers: { "Content-Type": "application/json" },
    method: endpoint.method,
    body: JSON.stringify(body),
  });
  if (result.status !== 200) {
    const error = new Error(result.statusText);
    handleHttpError(error);
    closeAndDeleteForm();
    submitErrors.value = error.message;
    throw error;
  }
  const data = await result.text();
  if (endpoint.responseAction === EndpointResponseActions.DownloadResponse)
    downloadDataFromResponse(data);
};

const reorderEntitiesActionFunction = async (field: FormAction) => {
  await form.value.validate();
  if (formContainsErrors.value) return;
  try {
    await uploadCsvForReordering(extractActionArguments(field.actionType));
    const callback = getCallbackFunction();
    if (callback) await callback();
    closeAndDeleteForm();
    displaySuccessNotification(
      t("notifications.success.csvReordering.title"),
      t("notifications.success.csvReordering.description"),
    );
  } catch (error) {
    handleHttpError(error);
    submitErrors.value = error.message;
  }
};

const startOcrActionFunction = async (field: FormAction) => {
  try {
    if (!(await isFormValid())) return;
    const { id, collection } = extractActionArguments(field.actionType);
    addEditableMetadataKeys(Object.keys(form.value.values.intialValues), id);
    const metadata = parseIntialValuesForFormSubmit(
      form.value.values.intialValues,
      id,
    );
    const relations = parseRelationValuesForFormSubmit(
      form.value.values.relationValues,
    );
    await mutate({
      id: id,
      formInput: {
        metadata: metadata,
        relations: relations,
      },
      collection: collection,
    }).then(() => {
      displaySuccessNotification(
        t("notifications.success.entityUpdated.title"),
        t("notifications.success.entityUpdated.description"),
      );
    });
    if (form.value.values.intialValues.ocr_type === OcrType.ManualUpload)
      return;

    const document = await getQuery(field.actionQuery as string);
    await performOcrAction(document, id, form.value.values).then(() => {
      displaySuccessNotification(
        t("notifications.default.generate-ocr.title"),
        t("notifications.default.generate-ocr.description"),
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
    submitWithUpload: () => submitWithUploadActionFunction(field),
    updateMetadata: () => updateMetdataActionFunction(field),
    upload: () => uploadActionFunction(field),
    uploadWithOcr: () => uploadActionFunction(field),
    download: () => downloadActionFunction(field),
    ocr: () => startOcrActionFunction(field),
    endpoint: () => callEndpointActionFunction(field),
    uploadCsvForReordening: () => reorderEntitiesActionFunction(field),
    submitWithExtraMetadata: () => submitWithExtraMetadataActionFunction(field),
  };
  if (!field.actionType || !actionFunctions[field.actionType])
    throw Error(
      `Either actionType is undefined or the Elody frontend has no actionFunction for actionType '${field.actionType}'`,
    );
  showErrors.value = true;
  actionFunctions[field.actionType]();
};

const getFormProgressIndicator = (): ActionProgress | undefined => {
  if (!formFields.value) return undefined;
  const actionButton: FormAction | undefined = formFields.value.find(
    (formField: any) => formField.__typename === "FormAction",
  );
  if (!actionButton) return undefined;
  return actionButton.actionProgressIndicator || undefined;
};

const getUploadProgressSteps = (
  progressIndicator: ActionProgress,
): ActionProgressStep[] => {
  if (progressIndicator.type === ActionProgressIndicatorType.Spinner) return [];

  return Object.values(progressIndicator).filter(
    (value: any) =>
      typeof value === "object" && value.__typename === "ActionProgressStep",
  ) as ActionProgressStep[];
};

const resetVeeValidateForDynamicForm = (
  newQueryName: string,
  oldQueryName: string | undefined,
) => {
  resetForm();
  if (oldQueryName) deleteForm(oldQueryName);
  form.value = createForm(newQueryName, {
    intialValues: {},
  } as {
    [key: string]: object;
  });
};

const initializeForm = async (
  newQueryName: string,
  oldQueryName: string | undefined,
) => {
  resetVeeValidateForDynamicForm(newQueryName, oldQueryName);
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

const setShowErrors = (show: boolean) => {
  showErrors.value = show;
};

watch(
  () => props.dynamicFormQuery,
  async (newValue, oldValue) => {
    resetDynamicForm();
    reinitializeDynamicFormFunc.value = () =>
      initializeForm(newValue, oldValue);
    await initializeForm(newValue, oldValue);
  },
  { immediate: true },
);

watch(
  () => formFields.value,
  () => {
    const progressIndicator = getFormProgressIndicator();
    if (progressIndicator)
      uploadProgress.value = getUploadProgressSteps(progressIndicator);
  },
  { immediate: true },
);

watch(
  () => form.value?.values.intialValues,
  (intialValues: { [key: string]: any }) => {
    if (intialValues && intialValues.standaloneUploadType)
      standaloneFileType.value = intialValues.standaloneUploadType;
    useBaseModal().changeCloseConfirmation(
      TypeModals.DynamicForm,
      form.value?.meta.dirty && !formClosing.value,
    );
  },
  { deep: true, immediate: true },
);

watch(
  () => form.value?.values,
  async () => {
    await form.value?.validate();
  },
  { deep: true },
);

watch(
  () => dynamicFormLoaded.value,
  () => {
    if (dynamicFormLoaded.value && props.prefilledFormValues) {
      // Todo: This timeout is ugly, form creation from metadatafields should be awaited
      setTimeout(() => {
        form.value.setValues(props.prefilledFormValues);
      }, 100);
    }
  },
);

onUnmounted(() => (dynamicFormLoaded.value = false));
</script>

<style scoped></style>
