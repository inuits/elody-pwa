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
      <div v-if="isBulkEditFormWithRelations" class="pb-4">
        <AdvancedDropdown
          data-cy="bulk-edit-relation-mode"
          v-model="selectedRelationMode"
          :options="relationModeOptions"
          :label="t('bulk-operations.relation-mode.label')"
          :clearable="false"
          :add-label-to-value="true"
          label-position="inline"
        />
      </div>
      <div
        v-for="(field, index) in getSortedFieldArray"
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
          :form-id="formId"
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
          :selection-limit="getSelectionLimit()"
          :show-button="true"
          :enable-advanced-filters="true"
          :search-mode="
            field.inputField?.entityPickerSearchConfig?.mode ?? undefined
          "
          :search-metadata-keys="
            field.inputField?.entityPickerSearchConfig?.metadataKeys ??
            undefined
          "
          :search-accepted-types="
            field.inputField?.entityPickerSearchConfig?.acceptedTypes ??
            undefined
          "
          :search-static-filters="
            field.inputField?.entityPickerSearchConfig?.staticFilters ??
            undefined
          "
        />
        <metadata-wrapper
          v-if="
            field.__typename === 'PanelMetaData' &&
            !nonStandardFieldTypes.includes(field.inputField.type)
          "
          v-show="!field.hiddenField?.hidden"
          :form-id="formId"
          :metadata="field as PanelMetaData"
          :is-edit="true"
          form-flow="create"
          :show-errors="showErrors"
          :key="`${dynamicFormQuery}_field_${index}`"
          :is-used-in-modal="true"
        />
        <p
          v-if="field.onlyForEntityTypes?.length && isBulkEditForm"
          class="text-xs text-text-body pt-1"
        >
          {{
            t("bulk-operations.field-partial-scope", [
              bulkItemCountForTypes(field.onlyForEntityTypes),
              bulkItems.length,
            ])
          }}
        </p>
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
                :shouldIncludeTypeInUrl="
                  (uploadContainerField as UploadField).addTypeToEndpoint
                "
                :typeToIncludeInUrl="typeToAddToUploadUrl"
              />
            </div>
            <div
              v-if="uploadContainerField.__typename === 'PanelMetaData'"
              class="pb-4"
            >
              <metadata-wrapper
                :form-id="formId"
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
            (field as FormAction).actionType == ActionType.UploadWithMetadata ||
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
            field.actionType !== ActionType.UploadWithMetadata &&
            field.actionType !== ActionType.UploadWithOcr &&
            field.actionType !== ActionType.UploadCsvForReordening &&
            field.actionType !== ActionType.UpdateMetadata &&
            field.actionType !== ActionType.SubmitWithUpload
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
          :disabled="
            isButtonDisabled ||
            (!!busyActionType && busyActionType !== field.actionType)
          "
          :loading="busyActionType === field.actionType"
          :icon="field.icon"
          button-style="accentAccent"
          @click="performActionButtonClickEvent(field)"
        />
        <p
          v-if="submitErrors && index === getSortedFieldArray.length - 1"
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
  ActionProgress,
  ActionProgressStep,
  Entity,
  BaseRelationValuesInput,
  EntityInput,
  FormAction,
  MetadataInput,
  MutateEntityValuesMutation,
  MutateEntityValuesMutationVariables,
  BulkEditEntitiesMutation,
  BulkEditEntitiesMutationVariables,
  BulkUpdateEntitiesWithJsonMutation,
  BulkUpdateEntitiesWithJsonMutationVariables,
  PanelMetaData,
  UploadContainer,
  UploadField,
} from "@/generated-types/queries";
import {
  ActionProgressIndicatorType,
  ActionType,
  BaseFieldType,
  Collection,
  EndpointResponseActions,
  EntityPickerMode,
  MutateEntityValuesDocument,
  BulkEditEntitiesDocument,
  BulkUpdateEntitiesWithJsonDocument,
  BulkEditModes,
  OcrType,
  RouteNames,
  TypeModals,
  UploadFlow,
  Entitytyping,
  FormFields,
} from "@/generated-types/queries";
import { useImport } from "@/composables/useImport";
import { useDynamicForm } from "@/components/dynamicForms/useDynamicForm";
import { computed, inject, ref, watch, onUnmounted } from "vue";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import UploadInterfaceDropzone from "@/components/UploadInterfaceDropzone.vue";
import { useI18n } from "vue-i18n";
import useUpload from "@/composables/upload/useUpload";
import {
  calculateFutureDate,
  goToEntityPage,
  goToEntityPageById,
} from "@/helpers";
import { type Router, useRoute } from "vue-router";
import DynamicFormUploadButton from "@/components/dynamicForms/DynamicFormUploadButton.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import AdvancedDropdown from "@/components/base/AdvancedDropdown.vue";
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
import { useBlockingLoader } from "@/composables/useBlockingLoader";
import ImportWrapper from "@/components/imports/ImportWrapper.vue";
import useEntitySingle from "@/composables/useEntitySingle";
import DynamicFormSkeleton from "./DynamicFormSkeleton.vue";
import { useEditMode } from "@/composables/useEdit";
import { useConfirmModal } from "@/composables/useConfirmModal";
import { useBulkOperations } from "@/composables/useBulkOperations";
import { useBulkEditForm } from "@/composables/useBulkEditForm";
import { useUploadState } from "@/composables/upload/useUploadState";

const props = withDefaults(
  defineProps<{
    dynamicFormQuery: string;
    formKey?: string;
    allFormKeys?: string[];
    router: Router;
    modalFormFields?: object;
    tabName?: string;
    showFormTitle?: boolean;
    prefilledFormValues?: object;
    allFormRelationTypes?: string[];
    emitEntityCreated?: boolean;
    skipEntityMutation?: boolean;
  }>(),
  {
    formKey: undefined,
    modalFormFields: undefined,
    showFormTitle: true,
    allFormRelationTypes: undefined,
    emitEntityCreated: false,
    skipEntityMutation: false,
  },
);

const emit = defineEmits([
  "entityCreated",
  "dynamicFormReady",
  "valuesSubmitted",
]);

type FormFieldTypes = UploadContainer | PanelMetaData | FormAction;
const nonStandardFieldTypes: BaseFieldType[] = [
  BaseFieldType.BaseFileSystemImportField,
  BaseFieldType.BaseEntityPickerField,
  BaseFieldType.BaseMagazineWithMetsImportField,
  BaseFieldType.BaseMagazineWithCsvImportField,
];

const modalFormFields = props.modalFormFields;
const config: any = inject("config");
const tabs: any = inject("TabsProvider");
const { getTenants } = useTenant(apolloClient as ApolloClient<any>, config);
const { currentTenant } = useApp();
const {
  getForm,
  createForm,
  deleteForm,
  parseRelationValuesForFormSubmit,
  parseInheritedRelationValuesFromFormSubmit,
  parseIntialValuesForFormSubmit,
  addEditableMetadataKeys,
  buildBulkEditPayload,
  getBulkEditRelationMode,
  setBulkEditRelationMode,
} = useFormHelper();
const { confirm } = useConfirmModal();
const { dequeueItemForBulkProcessing, getEnqueuedItems } = useBulkOperations();
const { buildJsonDocuments, groupIdsByType } = useBulkEditForm();
const {
  displaySuccessNotification,
  displayWarningNotification,
  displayErrorNotification,
} = useBaseNotification();
const busyActionType = ref<string | undefined>(undefined);
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
  dryRunFeedback,
  getDryRunFeedback,
} = useUpload(config);
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
  getSelectionLimit,
} = useEntityPickerModal();
const {
  extractActionArguments,
  getCallbackFunctions,
  getParentId,
  setArgumentForSubmitAllFormTabs,
} = useModalActions();
const route = useRoute();

const { mutate } = useMutation<
  MutateEntityValuesMutation,
  MutateEntityValuesMutationVariables
>(MutateEntityValuesDocument);

const { mutate: bulkEdit } = useMutation<
  BulkEditEntitiesMutation,
  BulkEditEntitiesMutationVariables
>(BulkEditEntitiesDocument);

const { mutate: bulkUpdateWithJson } = useMutation<
  BulkUpdateEntitiesWithJsonMutation,
  BulkUpdateEntitiesWithJsonMutationVariables
>(BulkUpdateEntitiesWithJsonDocument);

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

const formId = computed<string>(() => {
  if (props.formKey) return props.formKey;
  return props.dynamicFormQuery;
});

const normalizeModalFormFields = (formFields: FormFields) => {
  return Object.values(formFields).filter((value) => typeof value === "object");
};

const fieldTypeMap = computed<Record<string, string[]>>(() => {
  if (!Array.isArray(getSortedFieldArray.value)) return;

  return getSortedFieldArray.value?.reduce(
    (map, field) => {
      if (field.onlyForEntityTypes && field.onlyForEntityTypes.length > 0) {
        map[field.key] = field.onlyForEntityTypes;
      }
      return map;
    },
    {} as Record<string, string[]>,
  );
});

const getFieldArray = computed(() => {
  return modalFormFields
    ? normalizeModalFormFields(modalFormFields)
    : formFields.value || [];
});

const getSortedFieldArray = computed(() => {
  return getFieldArray.value?.toSorted((a, b) => {
    return (
      (a.__typename === "FormAction" ? 1 : 0) -
      (b.__typename === "FormAction" ? 1 : 0)
    );
  });
});

const isBulkEditForm = computed<boolean>(() =>
  (getFieldArray.value ?? []).some(
    (field: any) => field.actionType === ActionType.BulkUpdateMetadata,
  ),
);

const isBulkEditFormWithRelations = computed<boolean>(
  () =>
    isBulkEditForm.value &&
    (getFieldArray.value ?? []).some(
      (field: any) => field.inputField?.relationType,
    ),
);

// A bulk-edit form runs either in the merged bulk-edit modal or, for a
// single-type form configured with a formQuery, in the plain DynamicForm modal.
const bulkEditContext = computed(
  () =>
    getModalInfo(TypeModals.BulkOperationsEdit).context ??
    getModalInfo(TypeModals.DynamicForm).context,
);

const bulkItems = computed(() =>
  bulkEditContext.value ? getEnqueuedItems(bulkEditContext.value as any) : [],
);

const bulkItemCountForTypes = (types: string[]): number =>
  bulkItems.value.filter((item: any) =>
    types.some(
      (type) => String(type).toLowerCase() === String(item.type).toLowerCase(),
    ),
  ).length;

const relationModeOptions = [
  { label: "bulk-operations.relation-mode.add", value: BulkEditModes.Add },
  {
    label: "bulk-operations.relation-mode.replace",
    value: BulkEditModes.Replace,
  },
  { label: "bulk-operations.relation-mode.remove", value: BulkEditModes.Remove },
];

const selectedRelationMode = computed<BulkEditModes>({
  get: () => getBulkEditRelationMode(formId.value),
  // AdvancedDropdown emits either the raw value or the whole option
  set: (mode: any) =>
    setBulkEditRelationMode(
      formId.value,
      mode?.value ?? mode ?? BulkEditModes.Add,
    ),
});

// A bulk-edit form is applied to entities it never loaded, so its own field keys
// are the editable set. Seeding them here lets MetadataWrapper strip back the
// ones the user has no canEdit permission for, before anything is submitted.
watch(
  () => getFieldArray.value,
  (fields: any[]) => {
    if (!isBulkEditForm.value) return;
    addEditableMetadataKeys(
      fields
        .filter((field) => field.__typename === "PanelMetaData" && field.key)
        .map((field) => field.key),
      formId.value,
    );
  },
  { immediate: true },
);

const form = ref<FormContext<any>>();
const formContainsErrors = computed(
  (): boolean => Object.keys(form.value?.errors ?? {}).length > 0,
);
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
  // A caller-supplied field set (bulk edit) has no fetched form behind it.
  if (modalFormFields) return false;
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

const typeToAddToUploadUrl = computed<string | undefined>(() => {
  const uploadContainer: UploadContainer | undefined = formFields.value?.find(
    (formField: any) => formField.__typename === "UploadContainer",
  ) as UploadContainer | undefined;
  if (!uploadContainer) return false;
  const uploadTypeField = Object.values(uploadContainer).find(
    (item) => item.__typename === "UploadField",
  );
  const keyToExtract = uploadTypeField.extractTypeFromKey;
  if (!keyToExtract) return undefined;
  const initialValues = form.value?.values?.intialValues || {};
  return initialValues[keyToExtract];
});

const createEntityFromFormInput = async (
  entityType: Entitytyping,
  relations: BaseRelationValuesInput[] | undefined = undefined,
  onlyAllowedFields: boolean = false,
  formContext?: FormContext,
): Promise<EntityInput> => {
  const currentForm: FormContext = formContext ? formContext : form.value;
  const entity: EntityInput = { type: entityType };
  const initialValues = currentForm.values?.intialValues || {};
  const keysToInclude = getMetadataKeysToInclude(
    entityType,
    onlyAllowedFields,
    currentForm,
  );

  entity.metadata = extractMetadataFromValues(initialValues, keysToInclude);
  if (onlyAllowedFields) {
    entity.relations = [];
  } else {
    entity.relations = (await buildEntityRelations(
      relations,
      currentForm,
    )) as BaseRelationValuesInput[];
  }
  return entity;
};

const getMetadataKeysToInclude = (
  entityType: Entitytyping,
  onlyAllowedFields: boolean,
  formContext?: FormContext,
): string[] => {
  const currentForm: FormContext = formContext ? formContext : form.value;
  const initialValues = currentForm?.values?.intialValues || {};
  const allKeys = Object.keys(initialValues);

  const map = fieldTypeMap.value;
  if (onlyAllowedFields) {
    if (!map) return [];
    return allKeys.filter((key) => {
      const allowedTypes = map[key];
      if (!Array.isArray(allowedTypes)) return false;
      return allowedTypes.some((t) => String(t) === String(entityType));
    });
  }

  if (!map) return allKeys;
  return allKeys.filter((key) => {
    const allowedTypes = map[key];
    if (!Array.isArray(allowedTypes)) return true;
    return allowedTypes.some((t) => String(t) === String(entityType));
  });
};

const extractMetadataFromValues = (
  initialValues: Record<string, any>,
  keys: string[],
): MetadataInput[] =>
  keys
    .map((key) =>
      key === "ttl"
        ? { key, value: calculateFutureDate(initialValues[key]) }
        : { key, value: initialValues[key] },
    )
    .filter((item: MetadataInput) => item.value);

const buildEntityRelations = async (
  baseRelations?: BaseRelationValuesInput[],
  formContext?: FormContext,
) => {
  const currentForm: FormContext = formContext ? formContext : form.value;
  const fromForm = parseRelationValuesForFormSubmit(
    currentForm?.values?.relationValues,
  );
  const inherited = await parseInheritedRelationValuesFromFormSubmit(
    currentForm?.values?.relationValues,
  );
  return baseRelations && baseRelations.length > 0
    ? [...baseRelations, ...fromForm, ...inherited]
    : [...fromForm, ...inherited];
};

const hasFieldsForEntityType = (entityType: Entitytyping): boolean => {
  const map = fieldTypeMap.value;
  if (!map) return false;
  return Object.values(map).some((types) =>
    Array.isArray(types)
      ? types.some((t) => String(t) === String(entityType))
      : false,
  );
};
const getQuery = async (queryName: string) => {
  return await loadDocument(queryName);
};

const isFormValid = async () => {
  const result = await form.value.validate();
  if (result.valid) formClosing.value = true;
  return result.valid;
};

const uploadActionFunction = async () => {
  if (!enableUploadButton.value) return;
  if (!(await isFormValid())) return;
  const hasFieldsForEntityTypeValue = hasFieldsForEntityType(
    Entitytyping.Mediafile,
  );
  const mediafilesEntity = hasFieldsForEntityTypeValue
    ? await createEntityFromFormInput(Entitytyping.Mediafile, undefined, true)
    : undefined;
  await upload(
    isLinkedUpload.value,
    mediafilesEntity,
    form?.value?.values.intialValues,
    config,
    t,
  );
  if (jobIdentifier.value) {
    goToEntityPageById(
      jobIdentifier.value,
      { type: "job", __typename: "job" },
      "SingleEntity",
      props.router,
    );
  }
};

const uploadWithMetadataActionFunction = async (field: FormAction) => {
  if (!enableUploadButton.value) return;
  const entityInput = await createEntityFromFormInput(field.creationType);

  const uploadedFilenames = mediafiles.value
    .map((file) => file.name)
    .join(", ");

  await upload(isLinkedUpload.value, entityInput, config, t);
  if (props.emitEntityCreated) {
    deleteForm(formId.value);
    emit("entityCreated", {
      id: useEntitySingle().getEntityUuid(),
      intialValues: uploadedFilenames
        ? { label: uploadedFilenames }
        : undefined,
    });
    return;
  }
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
  // The editor that opened the tagging modal owns the configuration, so it resolves
  // the relation type and links the tag itself.
  const modalInfo = getModalInfo(TypeModals.ElodyEntityTaggingModal);
  modalInfo.editor?.commands.tagAndLinkEntity(entity, route.params["id"]);
};

const submitActionFunction = async (field: FormAction) => {
  const useEditHelper = useEditMode(getParentId());
  if (useEditHelper?.isEdit) {
    useEditHelper.clickButton();
    await useEditHelper.save();
    if (useEditHelper.isDisabled) {
      closeModal(TypeModals.DynamicForm);
      displayWarningNotification(
        "notifications.warning.entity-not-updated.title",
        "notifications.warning.entity-not-updated.description",
      );
      return;
    }
  }

  if (!(await isFormValid())) return;

  if (props.skipEntityMutation) {
    // used by guided flow's metadataOnly steps: this form just collects field
    // values (e.g. relation metadata) — no entity gets created or updated.
    showErrors.value = false;
    emit("valuesSubmitted", form.value?.values.intialValues ?? {});
    deleteForm(formId.value);
    return;
  }

  const document = await getQuery(field.actionQuery as string);
  const relations = extractActionArguments(field.actionType);
  if (form.value) {
    const { setValues } = form.value;
    setValues({
      relationValues: {
        ...form.value.values.relationValues,
        ...relations,
      },
    });
  }
  const entityInput = await createEntityFromFormInput(field.creationType);
  let entity: Entity;
  try {
    entity = (await performSubmitAction(document, entityInput)).data
      .CreateEntity;
    showErrors.value = false;
    await getTenants();
    const callbackFunctions: [() => void] | undefined = extractActionArguments(
      field.actionType,
    );
    if (props.emitEntityCreated) {
      // the host (e.g. a guided flow) handles what happens with the entity
      // and swaps in the next form itself. closeAndDeleteForm's upload reset
      // would re-fetch THIS form's definition into the shared dynamicForm
      // state and overwrite the next form's fields, so only drop the form.
      deleteForm(formId.value);
      emit("entityCreated", entity);
    } else {
      if (config.features.hasBulkSelect && callbackFunctions !== undefined) {
        for (const callback of callbackFunctions) {
          if (callback) await callback();
        }
      } else if (getModalInfo(TypeModals.ElodyEntityTaggingModal).open) {
        tagNewlyCreatedEntity(entity);
      } else {
        setTimeout(
          () => goToEntityPage(entity, "SingleEntity", props.router),
          1,
        );
      }
      closeAndDeleteForm();
    }
    displaySuccessNotification(
      t("notifications.success.entityCreated.title"),
      t("notifications.success.entityCreated.description"),
    );
  } catch (e: ApolloError) {
    console.error(e);
    const errorObject = await getMessageAndCodeFromApolloError(e);
    isPerformingAction.value = false;
    submitErrors.value = errorObject.message;
  }
};

const submitAllFormTabsActionFunction = async (field: FormAction) => {
  const useEditHelper = useEditMode(getParentId());
  if (useEditHelper?.isEdit) {
    useEditHelper.clickButton();
    await useEditHelper.save();
    if (useEditHelper.isDisabled) {
      closeModal(TypeModals.DynamicForm);
      displayWarningNotification(
        "notifications.warning.entity-not-updated.title",
        "notifications.warning.entity-not-updated.description",
      );
      return;
    }
  }
  if (!(await isFormValid())) return;

  const entities: Entity[] = [];
  try {
    const document = await getQuery(field.actionQuery as string);
    for (const formKeyIndex in props.allFormKeys) {
      const form = getForm(props.allFormKeys[formKeyIndex]);

      const relations = extractActionArguments(field.actionType);
      if (!Array.isArray(relations)) {
        const { setValues } = form;
        setValues({
          relationValues: {
            ...form.values.relationValues,
            ...relations,
          },
        });
      }

      const entityInput = await createEntityFromFormInput(
        field.creationType,
        undefined,
        undefined,
        form,
      );
      let entity: Entity;
      entity = (await performSubmitAction(document, entityInput)).data
        .CreateEntity;
      setArgumentForSubmitAllFormTabs(
        entity["id"],
        props.allFormRelationTypes[formKeyIndex],
      );
      showErrors.value = false;
      entities.push(entity);
    }

    await getTenants();
    const callbackFunctions: [() => void] | undefined = extractActionArguments(
      field.actionType,
    );
    if (config.features.hasBulkSelect && callbackFunctions !== undefined) {
      for (const callback of callbackFunctions) {
        if (callback) await callback();
      }
    } else {
      if (getModalInfo(TypeModals.ElodyEntityTaggingModal).open) {
        entities.forEach((entity: Entity) => tagNewlyCreatedEntity(entity));
      } else
        setTimeout(
          () => goToEntityPage(entities[0], "SingleEntity", props.router),
          1,
        );
    }
    closeAndDeleteForm();
    displaySuccessNotification(
      t("notifications.success.entityCreated.title"),
      t("notifications.success.entityCreated.description"),
    );
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
    const callbackFunctions: [() => void] | undefined = extractActionArguments(
      field.actionType as ActionType,
    );
    if (config.features.hasBulkSelect && callbackFunctions !== undefined) {
      for (const callback of callbackFunctions) {
        if (callback) await callback();
      }
    } else {
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
  entityInput.metadata?.push(
    ...extractActionArguments(field.actionType as ActionType),
  );
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

const validateAndGoToNextFormTabActionFunction = async (field: FormAction) => {
  const valid = await isFormValid();
  if (!valid) return;
  tabs.selectedIndex++;
};

const goToPreviousFormTabActionFunction = async (field: FormAction) => {
  tabs.selectedIndex--;
};

const downloadActionFunction = async (field: FormAction) => {
  if (!(await isFormValid())) return;
  try {
    const variables = extractActionArguments(field.actionType as ActionType);
    const document = await getQuery(field.actionQuery as string);
    const entityInput = await createEntityFromFormInput(
      field.creationType,
      variables.relations,
    );
    await performDownloadAction(
      document,
      variables,
      entityInput,
      form.value.values,
    );
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

// The batch endpoint answers with per-row {errors, warnings} keyed by collection,
// the same shape a csv dry run returns. Feeding it to dryRunFeedback puts the
// messages on the file preview, where an upload shows them, instead of dumping
// the whole response body under the button.
const __showCsvBatchFeedback = async (body: any): Promise<boolean> => {
  let batchResult = body;
  if (typeof batchResult === "string") {
    try {
      batchResult = JSON.parse(batchResult);
    } catch {
      return false;
    }
  }
  if (!batchResult?.errors && !batchResult?.warnings) return false;

  const feedback = await getDryRunFeedback(batchResult);
  if (!feedback.errors.length && !feedback.warnings.length) return false;
  dryRunFeedback.value = feedback;
  submitErrors.value = feedback.errors.length
    ? (t("upload-fields.errors.csv-rows-failed", [
        feedback.errors.length,
      ]) as string)
    : undefined;
  return true;
};

const updateMetdataActionFunction = async (field: FormAction) => {
  if (!(await isFormValid())) return;
  try {
    submitErrors.value = undefined;
    dryRunFeedback.value = { errors: [], warnings: [] };
    const document = await getQuery(field.actionQuery as string);
    let csv: string;
    await __getCsvString().then((csvResult) => {
      csv = csvResult;
    });
    const result = await performUpdateMetadataAction(
      document,
      form.value.values.intialValues.type,
      csv,
    );
    if (await __showCsvBatchFeedback(result?.data?.updateMetadataWithCsv))
      return;
    closeAndDeleteForm();
    displaySuccessNotification(
      t("notifications.success.updateMetadataCsv.title"),
      t("notifications.success.updateMetadataCsv.description"),
    );
  } catch (error: ApolloError) {
    if (
      await __showCsvBatchFeedback(
        error?.graphQLErrors?.[0]?.extensions?.response?.body,
      )
    )
      return;
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
    // already surfaced to the user here; returning (rather than throwing)
    // keeps the dispatcher from stacking a second, vaguer notification on top
    handleHttpError(error);
    closeAndDeleteForm();
    submitErrors.value = error.message;
    return;
  }
  const data = await result.text();
  if (endpoint.responseAction === EndpointResponseActions.DownloadResponse)
    downloadDataFromResponse(data);
};

const reorderEntitiesActionFunction = async (field: FormAction) => {
  await form.value.validate();
  if (formContainsErrors.value) return;
  const { startBlocking, stopBlocking } = useBlockingLoader();
  try {
    startBlocking(t("modals.reorderingEntities"));
    await uploadCsvForReordering(extractActionArguments(field.actionType));
    const callbackFunctions = getCallbackFunctions();
    if (callbackFunctions !== undefined) {
      for (const callback of callbackFunctions) {
        if (callback) await callback();
      }
    }
    closeAndDeleteForm();
    displaySuccessNotification(
      t("notifications.success.csvReordering.title"),
      t("notifications.success.csvReordering.description"),
    );
  } catch (error) {
    handleHttpError(error);
  } finally {
    stopBlocking();
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

const bulkUpdateMetadataActionFunction = async (field: FormAction) => {
  try {
    if (!(await isFormValid())) return;

    const { ids } = extractActionArguments(field.actionType);
    if (!ids?.length) {
      displayErrorNotification(
        t("notifications.errors.bulk-edit-without-selection.title"),
        t("notifications.errors.bulk-edit-without-selection.description"),
      );
      return;
    }

    const typePerId = new Map<string, string | undefined>(
      bulkItems.value.map((item: any) => [item.id, item.type]),
    );
    const { byType, missingType } = groupIdsByType(
      ids.map((id: string) => ({
        id,
        type:
          typePerId.get(id) ?? (route.meta.entityType as string | undefined),
      })),
    );
    // Without a type an entity cannot be routed to a document, and a bulk write
    // that silently skips part of the selection is worse than one that refuses.
    if (missingType.length > 0) {
      displayErrorNotification(
        t("notifications.errors.bulk-edit-untyped-items.title"),
        t("notifications.errors.bulk-edit-untyped-items.description", [
          missingType.length,
        ]),
      );
      return;
    }
    const payload = buildBulkEditPayload(form.value.values, {
      formId: formId.value,
      isFieldDirty: (path: string) => form.value.isFieldDirty(path),
      relationMode: selectedRelationMode.value,
    });

    if (!payload.hasChanges) {
      displayWarningNotification(
        t("notifications.warning.bulk-edit-without-changes.title"),
        t("notifications.warning.bulk-edit-without-changes.description"),
      );
      return;
    }

    const changeCount =
      payload.metadata.length +
      payload.relationsToAdd.length +
      payload.relationsToRemove.length +
      payload.relationsToReplace.length;
    const choice = await confirm({
      title: t("confirm.bulk-edit.title"),
      message: t("confirm.bulk-edit.message", [
        changeCount,
        ids.length,
        t(`bulk-operations.relation-mode.${selectedRelationMode.value}`),
      ]),
      confirmLabel: t("confirm.bulk-edit.confirm"),
      cancelLabel: t("confirm.bulk-edit.cancel"),
    });
    if (choice !== "confirm") return;

    const succeededPerTransport: string[][] = [];
    const failedIds = new Set<string>();

    // Metadata (merged by key) and relation replacement (a relation type in the
    // document overwrites that type) match the batch endpoint's own semantics.
    const documents = buildJsonDocuments(
      byType,
      payload,
      fieldTypeMap.value ?? {},
      selectedRelationMode.value,
    );

    if (documents.length > 0) {
      const jsonResult = await bulkUpdateWithJson({ documents });
      const jsonOutcome = jsonResult?.data?.bulkUpdateEntitiesWithJson;
      const jsonSucceeded = jsonOutcome?.succeededIds ?? [];

      if (jsonSucceeded.length === 0) {
        // Nothing landed: this client has no json batch serializer (or the endpoint
        // refused the whole body). Write the same values through the per-entity
        // mutation, which every client supports.
        const fallbackResult = await bulkEdit({
          ids: documents.map((document: any) => document.id),
          metadata: payload.metadata,
          relationsToAdd: [],
          relationsToRemove: [],
          relationsToReplace:
            selectedRelationMode.value === BulkEditModes.Replace
              ? payload.relationsToReplace
              : [],
          collection: Collection.Entities,
        });
        const fallbackOutcome = fallbackResult?.data?.bulkEditEntities;
        succeededPerTransport.push(fallbackOutcome?.succeededIds ?? []);
        (fallbackOutcome?.failedIds ?? []).forEach((id: string) =>
          failedIds.add(id),
        );
      } else {
        succeededPerTransport.push(jsonSucceeded);
        (jsonOutcome?.failedIds ?? []).forEach((id: string) => failedIds.add(id));
      }
    }

    // Adding and removing relations need the read-modify-write mutation: the batch
    // endpoint would overwrite the whole relation type instead.
    const relationsToAdd =
      selectedRelationMode.value === BulkEditModes.Add
        ? payload.relationsToAdd
        : [];
    const relationsToRemove =
      selectedRelationMode.value === BulkEditModes.Remove
        ? payload.relationsToRemove
        : [];
    if (relationsToAdd.length > 0 || relationsToRemove.length > 0) {
      const mutationResult = await bulkEdit({
        ids,
        metadata: [],
        relationsToAdd,
        relationsToRemove,
        relationsToReplace: [],
        collection: Collection.Entities,
      });
      const mutationOutcome = mutationResult?.data?.bulkEditEntities;
      succeededPerTransport.push(mutationOutcome?.succeededIds ?? []);
      (mutationOutcome?.failedIds ?? []).forEach((id: string) =>
        failedIds.add(id),
      );
    }

    // An entity is done when every transport that actually carried work for it
    // reported it. Entities whose type had no applicable field are not written to
    // at all, so they are finished rather than failed.
    const writtenIds = new Set<string>([
      ...documents.map((document: any) => document.id),
      ...(relationsToAdd.length > 0 || relationsToRemove.length > 0 ? ids : []),
    ]);
    const skippedIds = ids.filter((id: string) => !writtenIds.has(id));
    const succeededIds = ids.filter(
      (id: string) =>
        !failedIds.has(id) &&
        (skippedIds.includes(id) ||
          succeededPerTransport.every((succeeded) => succeeded.includes(id))),
    );

    if (bulkEditContext.value)
      succeededIds.forEach((id: string) =>
        dequeueItemForBulkProcessing(bulkEditContext.value as any, id),
      );

    const callbackFunctions = getCallbackFunctions();
    if (callbackFunctions !== undefined) {
      for (const callback of callbackFunctions) {
        if (callback) await callback();
      }
    }

    const updatedCount = succeededIds.length - skippedIds.length;
    if (updatedCount > 0)
      displaySuccessNotification(
        t("notifications.success.entitiesUpdated.title"),
        t("notifications.success.entitiesUpdated.description", [updatedCount]),
      );

    if (skippedIds.length > 0)
      displayWarningNotification(
        t("notifications.warning.bulk-edit-skipped-items.title"),
        t("notifications.warning.bulk-edit-skipped-items.description", [
          skippedIds.length,
        ]),
      );

    // Keep the failed entities selected and the modal open, so a partial batch
    // can be retried without reselecting everything.
    if (succeededIds.length < ids.length) {
      displayErrorNotification(
        t("notifications.errors.bulk-edit-partially-failed.title"),
        t("notifications.errors.bulk-edit-partially-failed.description", [
          ids.length - succeededIds.length,
        ]),
      );
      return;
    }

    closeAndDeleteForm();
    closeModal(TypeModals.BulkOperationsEdit);
  } catch (e) {
    submitErrors.value = e.message;
  }
};

const performActionButtonClickEvent = (field: FormAction): void => {
  useBaseModal().changeCloseConfirmation(TypeModals.DynamicForm, false);

  const actionFunctions: { [key: string]: () => any } = {
    submit: () => submitActionFunction(field),
    submitWithUpload: () => submitWithUploadActionFunction(field),
    updateMetadata: () => updateMetdataActionFunction(field),
    upload: () => uploadActionFunction(),
    uploadWithMetadata: () => uploadWithMetadataActionFunction(field),
    uploadWithOcr: () => uploadActionFunction(),
    download: () => downloadActionFunction(field),
    ocr: () => startOcrActionFunction(field),
    endpoint: () => callEndpointActionFunction(field),
    uploadCsvForReordening: () => reorderEntitiesActionFunction(field),
    submitWithExtraMetadata: () => submitWithExtraMetadataActionFunction(field),
    submitAllFormTabs: () => submitAllFormTabsActionFunction(field),
    nextFormTab: () => validateAndGoToNextFormTabActionFunction(field),
    previousFormTab: () => goToPreviousFormTabActionFunction(field),
    bulkUpdateMetadata: () => bulkUpdateMetadataActionFunction(field),
  };
  if (!field.actionType || !actionFunctions[field.actionType])
    throw Error(
      `Either actionType is undefined or the Elody frontend has no actionFunction for actionType '${field.actionType}'`,
    );
  showErrors.value = true;

  // One in-flight action at a time: re-entry here is the double-submit hole.
  if (busyActionType.value) return;
  busyActionType.value = field.actionType;
  Promise.resolve(actionFunctions[field.actionType]())
    .catch((error) => {
      console.error(`Action '${field.actionType}' failed:`, error);
      displayErrorNotification(
        t("notifications.errors.generic.title"),
        t("notifications.errors.generic.description"),
      );
    })
    .finally(() => {
      busyActionType.value = undefined;
    });
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
  // Fields were supplied by the caller: there is nothing to fetch, but the
  // template still waits on dynamicFormLoaded.
  if (modalFormFields) {
    dynamicFormLoaded.value = true;
    return;
  }
  if (!props.dynamicFormQuery) return;
  const document = await getQuery(props.dynamicFormQuery);
  getDynamicForm(document, props.tabName);
};

const closeAndDeleteForm = () => {
  closeModal(TypeModals.DynamicForm);
  changeExpandedState(false);
  deleteForm(formId.value);
  resetUpload();
};

const downloadDataFromResponse = (data: any) => {
  const blob = new Blob([data], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "data.csv";
  a.click();
  window.URL.revokeObjectURL(url);
};

const setShowErrors = (show: boolean) => {
  showErrors.value = show;
};

watch(
  () => formId.value,
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
    if (showErrors.value) {
      await form.value?.validate();
    }
  },
  { deep: true },
);

watch(
  () => dynamicFormLoaded.value,
  () => {
    if (dynamicFormLoaded.value && props.prefilledFormValues) {
      // Todo: This timeout is ugly, form creation from metadatafields should be awaited
      setTimeout(() => {
        form.value.setValues(props.prefilledFormValues, false);
      }, 100);
    }
  },
);

onUnmounted(() => {
  dynamicFormLoaded.value = false;
  useUploadState().resetState();
});
</script>

<style scoped></style>
