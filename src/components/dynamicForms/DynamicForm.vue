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
      <div
        v-for="(field, index) in getFieldArray"
        :key="`${dynamicFormQuery}_field_${index}`"
        class="pb-2"
      >
        <ImportComponent
          v-if="
            tabName?.length &&
            field.inputField?.type === 'baseFileSystemImportField'
          "
        />
        <metadata-wrapper
          v-else-if="field.__typename === 'PanelMetaData'"
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
            field.actionType !== ActionType.Upload
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
          button-style="accentAccent"
          @click="performActionButtonClickEvent(field)"
        />
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
  MutateEntityValuesMutation,
  MutateEntityValuesMutationVariables,
  MutateEntityValuesDocument,
  OcrType,
} from "@/generated-types/queries";
import { useImport } from "@/composables/useImport";
import { useDynamicForm } from "@/components/dynamicForms/useDynamicForm";
import { computed, inject, ref, watch, toRaw } from "vue";
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

const props = withDefaults(
  defineProps<{
    dynamicFormQuery: string;
    hasLinkedUpload?: boolean;
    savedContext?: any | undefined;
    router: Router;
    modalFormFields?: object;
    tabName?: string;
  }>(),
  {
    hasLinkedUpload: false,
    modalFormFields: undefined,
  }
);

const emit = defineEmits(["entityCreated"]);

type FormFieldTypes = UploadContainer | PanelMetaData | FormAction;

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
} = useUpload();

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
const { getMenuDestinations, changeExpandedState } = useMenuHelper();
const isLoading = computed(() => {
  if (isPerformingAction.value) return true;
  return !formFields.value && !dynamicForm.value;
});
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

const uploadActionFunction = async () => {
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
  await form.value.validate();
  if (formContainsErrors.value) return;
  const document = await getQuery(field.actionQuery as string);
  const entityInput = createEntityFromFormInput(field.creationType);
  const entity = (await performSubmitAction(document, entityInput)).data
    .CreateEntity;
  await getTenants();
  closeModal(TypeModals.DynamicForm);
  changeExpandedState(false);
  deleteForm(props.dynamicFormQuery);
  goToEntityPage(entity, "SingleEntity", props.router);
};

const submitWithExtraMetadata = async (field: FormAction) => {
  await form.value.validate();
  if (formContainsErrors.value) return;
  const document = await getQuery(field.actionQuery as string);
  const entityInput = createEntityFromFormInput(field.creationType);
  entityInput.metadata?.push(...props.savedContext);
  const entity = (await performSubmitAction(document, entityInput)).data
    .CreateEntity;
  emit("entityCreated", { ...entity, metadata: entityInput.metadata });
  await getTenants();
  closeModal(TypeModals.DynamicForm);
  changeExpandedState(false);
  deleteForm(props.dynamicFormQuery);
};

const downloadActionFunction = async (field: FormAction) => {
  await form.value.validate();
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

const updateMetdataActionFunction = async () => {
  await form.value.validate();
  if (formContainsErrors.value) return;
  //TODO: put code here that calls graphql function to the bulk edit endpoint in the collection-api
};

const callEndpointInGraphql = async (field: FormAction) => {
  if (!field.endpointInformation) return;
  const endpoint = field.endpointInformation;
  const body = {};
  endpoint.variables.forEach((variable) => {
    body[variable] = props.savedContext[variable];
  });
  await fetch(`${endpoint.endpointName}`, {
    method: endpoint.method,
    body: body,
  });
};

const startOcrActionFunction = async (field: FormAction) => {
  await form.value.validate();
  if (formContainsErrors.value) return;

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
  if (form.value.values.intialValues.ocr_type === OcrType.ManualUpload) return;

  const document = await getQuery(field.actionQuery as string);
  await performOcrAction(document, props.savedContext, form.value.values).then(
    () => {
      createNotificationOverwrite(
        NotificationType.default,
        t("notifications.default.generate-ocr.title"),
        t("notifications.default.generate-ocr.description")
      );
    }
  );
};

const performActionButtonClickEvent = (field: FormAction): void => {
  useBaseModal().changeCloseConfirmation(TypeModals.DynamicForm, false);
  const actionFunctions: { [key: string]: Function } = {
    submit: () => submitActionFunction(field),
    update: () => updateMetdataActionFunction(field),
    upload: () => uploadActionFunction(field),
    download: () => downloadActionFunction(field),
    ocr: () => startOcrActionFunction(field),
    endpoint: () => callEndpointInGraphql(field),
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
  if (
    props.savedContext &&
    ("mediafiles" in props.savedContext || "entities" in props.savedContext)
  ) {
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
  getDynamicForm(document, props.tabName);
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
      form.value?.meta.dirty
    );
  },
  { deep: true, immediate: true }
);
</script>

<style scoped></style>
