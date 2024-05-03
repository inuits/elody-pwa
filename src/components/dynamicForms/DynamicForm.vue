<template>
  <div class="p-4 pt-0 h-full w-full overflow-y-auto">
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
       <template v-if="hasImportAvailable">
         <ImportComponent v-if="field.key === 'fileSystemImport'" />
         <metadata-wrapper v-else
          v-if="field.__typename === 'PanelMetaData'"
          :form-id="dynamicFormQuery"
          :metadata="field as PanelMetaData"
          :is-edit="true"
          form-flow="create"
        />
       </template>
       <template v-else-if="!hasImportAvailable">
         <metadata-wrapper
             v-if="field.__typename === 'PanelMetaData' && field.key !== 'fileSystemImport'"
             :form-id="dynamicFormQuery"
             :metadata="field as PanelMetaData"
             :is-edit="true"
             form-flow="create"
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
            <div class="pb-2">
              <metadata-wrapper
                v-if="uploadContainerField.__typename === 'PanelMetaData'"
                :form-id="dynamicFormQuery"
                :metadata="uploadContainerField"
                :is-edit="true"
                form-flow="create"
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
        </template>
      </div>
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
import type { Context } from "@/composables/useBulkOperations";
import { useDynamicForm } from "@/components/dynamicForms/useDynamicForm";
import { computed, inject, ref, watch, defineEmits} from "vue";
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
import type { FormContext } from "vee-validate";
import { useFormHelper } from "@/composables/useFormHelper";
import useMenuHelper from "@/composables/useMenuHelper";
import ImportComponent from "@/components/ImportComponent.vue";

const props = withDefaults(
  defineProps<{
    dynamicFormQuery: string;
    hasLinkedUpload?: boolean;
    contextFromBulkOperations?: Context;
    router: Router;
    importAvailable?: boolean;
  }>(),
  {
    hasLinkedUpload: false,
    importAvailable: false,
  }
);

const hasImportAvailable = props.importAvailable;

const config = inject("config");
const { currentTenant } = useApp();

const { createForm, deleteForm } = useFormHelper();
const { loadDocument } = useImport();
const { closeModal } = useBaseModal();
const { getDynamicForm, dynamicForm, performSubmitAction } = useDynamicForm();
const { upload, enableUploadButton, uploadProgress, standaloneFileType } =
    useUpload();

interface FormObject {
  __typename: string;
}
const findFormTabObjects = (dynamicForm: Record<string, FormObject>): FormObject[] => {
  if (!dynamicForm) {
    return [];
  }

  return Object.values(dynamicForm).filter(value => value && value.__typename === "FormTab");
};

const formFields = computed<UploadField | PanelMetaData | FormAction | undefined>(() => {
  if (!dynamicForm.value || !dynamicForm.value["GetDynamicForm"]) {
    return undefined;
  }
  const formTabObjects = findFormTabObjects(dynamicForm.value["GetDynamicForm"]);
  if (formTabObjects.length === 0) {
    return undefined;
  }

  const allFormFields: (UploadField | PanelMetaData | FormAction)[] = [];
  for (const formTab of formTabObjects) {
    const formFields = Object.values(formTab.formFields).filter(value => typeof value === "object");
    allFormFields.push(...formFields);
  }

  return allFormFields;
});

const formTabs = computed<UploadField | PanelMetaData | FormAction | undefined>(() => {
  if (!dynamicForm.value || !dynamicForm.value["GetDynamicForm"]) {
    return [];
  }
  return dynamicForm.value.GetDynamicForm;
});

const tabsTitle = computed(() => {
  if (!formTabs.value) {
    return [];
  }
  const tabsArray = Object.entries(formTabs.value)
      .filter(([key, value]) => value.__typename === 'FormTab')
      .map(([key, value]) => ({ title: key, value }));
  return tabsArray;
});

const form = ref<FormContext<any>>();
const formContainsErrors = computed((): boolean => !form.value?.meta.valid);
const { getMenuDestinations } = useMenuHelper();
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
  useBaseModal().changeCloseConfirmation(TypeModals.DynamicForm, false);
  if (field.actionType === ActionType.Upload) {
    if (!enableUploadButton.value) return;
    upload(props.hasLinkedUpload, config, t);
    if (standaloneFileType.value)
      goToEntityTypeRoute(
        standaloneFileType.value,
        getMenuDestinations(),
        props.router
      );
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
  if (!props.dynamicFormQuery) return;
  const document = await getQuery(props.dynamicFormQuery);
  getDynamicForm(document);
};

watch(
  () => props.dynamicFormQuery,
  async (newValue, oldValue) => {
    if (deleteForm(oldValue))
      form.value = createForm(newValue, {
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

const emits = defineEmits(['dynamicFormReady']);

watch([formTabs, formFields, tabsTitle], ([tabs, fields, tabsTitle]) => {
  emits('dynamicFormReady', { formTabs: tabs, formFields: fields, tabsTitle: tabsTitle });
});
</script>

<style scoped></style>
