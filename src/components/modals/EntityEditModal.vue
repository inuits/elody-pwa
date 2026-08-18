<template>
  <base-modal
    v-if="formFlow !== ContextMenuFormFlow.Removal"
    :modal-type="TypeModals.EntityEditModal"
    modal-color="bg-background-light"
    modalHeightStyle="max-h-[75vh] my-[12.5vh]"
    @hide-modal="handleCloseModal"
  >
    <div class="bg-background-light w-full p-4">
      <div v-if="isLoading" class="flex justify-center items-center h-96">
        <spinner-loader theme="accent" />
      </div>

      <div v-else-if="relationConfig && relationFormFields">
        <h2 class="title m-0 pb-4">
          {{ t(formTitle) || t("modals.entityEdit.title") }}
        </h2>

        <dynamic-form
          :dynamic-form-query="currentFormQuery"
          :form-key="activeFormId"
          :modal-form-fields="relationFormFields"
          :prefilled-form-values="relationPrefill"
          :router="router"
          :show-form-title="false"
        />

        <div class="flex gap-2 pt-2">
          <BaseButtonNew
            label="Save"
            icon="Save"
            :loading="isSaving"
            :disabled="isSaving"
            button-style="accentAccent"
            button-size="small"
            @click="onSave"
          />
        </div>
      </div>

      <div v-else-if="entity && metadataFields.length > 0">
        <h2 class="title m-0 pb-4">{{ t(formTitle) || t("modals.entityEdit.title") }}</h2>

        <div class="space-y-2 mb-6">
          <metadata-wrapper
            v-for="field in metadataFields"
            :key="field.key"
            :metadata="field"
            :is-edit="true"
            :form-id="activeFormId"
            form-flow="edit"
            :base-library-mode="BaseLibraryModes.BasicBaseLibrary"
            @update:metadata="(val) => handleManualMetadataUpdate(val)"
          />
        </div>

        <div class="flex gap-2">
          <BaseButtonNew
            label="Save"
            icon="Save"
            :loading="isSaving"
            :disabled="!isFormValid || isSaving"
            button-style="accentAccent"
            button-size="small"
            @click="onSave"
          />
        </div>
      </div>

      <div v-else class="text-center py-8">
        <p class="text-gray-500">{{ t("modals.entityEdit.noFields") }}</p>
      </div>
    </div>
  </base-modal>
</template>

<script setup lang="ts">
import { watch, ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { apolloClient } from "@/main";
import {
  TypeModals,
  PanelType,
  BaseLibraryModes,
  ContextMenuFormFlow,
} from "@/generated-types/queries";
import { useRouter } from "vue-router";
import { useBaseModal } from "@/composables/useBaseModal";
import { useFormHelper } from "@/composables/useFormHelper";
import { useEntityEditor } from "@/composables/useEntityEditor";
import { useImport } from "@/composables/useImport";
import { mapUrlToEntityType, getMetadataFields } from "@/helpers";
import BaseModal from "@/components/base/BaseModal.vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import DynamicForm from "@/components/dynamicForms/DynamicForm.vue";

const { t } = useI18n();
const router = useRouter();
const { closeModal, getModalInfo } = useBaseModal();
const { deleteForm, getForm } = useFormHelper();
const { loadDocument } = useImport();
const {
  entity,
  editableFields,
  isLoading,
  isSaving,
  form,
  initialize,
  save,
  saveRelationConfig,
  handleManualMetadataUpdate,
} = useEntityEditor();

// Relation-config mode: edit metadata ON a relation (e.g. SHACL-derived
// processor config on a pipeline's hasProcessor relation) using a dynamic
// field set fetched from the related entity, instead of a static form query.
const relationConfig = ref<{
  targetEntityId: string;
  relationKey: string;
  relationType: string;
} | null>(null);
// fields object (modalFormFields) + prefilled values rendered by DynamicForm
const relationFormFields = ref<Record<string, any> | null>(null);
const relationPrefill = ref<Record<string, any>>({});
// Name of the field-source query, taken from the action's formQuery input and
// resolved by name at runtime — no client-specific query is baked in here.
const currentFormQuery = ref<string>("");

const currentEntityId = ref<string | null>(null);
const currentEntityType = ref<string | null>(null);
const formFlow = ref<ContextMenuFormFlow | null>(null);
const formTitle = ref<string>("");
const activeFormId = computed(() =>
  currentEntityId.value ? `${currentEntityId.value}_editing` : "",
);

const isFormValid = computed(() => form.value?.meta?.valid ?? false);

const metadataFields = computed(() =>
  getMetadataFields(
    editableFields.value,
    PanelType.Metadata,
    activeFormId.value,
  ),
);

const initializeRelationConfig = async (info: any) => {
  isLoading.value = true;
  try {
    currentFormQuery.value = info.formQuery || "";
    // Resolve the field-source query by name (the action's formQuery input),
    // exactly like useEntityEditor.initialize does. The query takes the related
    // entity id and returns a dynamic field-set (e.g. SHACL-derived processor
    // config). Reading the single root field keeps this query-name-agnostic.
    const document = await loadDocument(currentFormQuery.value);
    if (!document) {
      console.log(
        `Relation-config form query "${currentFormQuery.value}" not found`,
      );
      return;
    }
    const { data } = await apolloClient.query({
      query: document,
      // parentEntityId is the entity the relation hangs off (e.g. the
      // pipeline). Field-source queries that only declare $id ignore it;
      // those that relate two entities — connecting one component on a
      // pipeline to another — cannot be answered without it.
      variables: { id: info.entityId, parentEntityId: info.parentEntityId },
      fetchPolicy: "no-cache",
    });
    const formFields =
      (Object.values(data ?? {})[0] as Record<string, any>) || {};
    // field array drives the save (its keys); the object drives DynamicForm
    editableFields.value = Object.values(formFields).filter(
      (f: any) => f?.inputField,
    ) as any[];
    // Relation metadata keys may be dotted (e.g. "options.auth.type") for
    // nested shui:DetailsEditor fields; rebuild a nested object so the form's
    // nested fields (bound to intialValues.options.auth.type) prefill.
    const intialValues: Record<string, any> = {};
    const setNested = (obj: Record<string, any>, path: string, val: any) => {
      const parts = path.split(".");
      let cur = obj;
      parts.forEach((p, i) => {
        if (i === parts.length - 1) cur[p] = val;
        else cur = cur[p] ?? (cur[p] = {});
      });
    };
    (info.relationMetadata || []).forEach((m: any) => {
      setNested(intialValues, m.key, m.value);
    });
    relationFormFields.value = formFields;
    // DynamicForm sets these onto the form; fields bind to intialValues.<key>
    relationPrefill.value = { intialValues };
    relationConfig.value = {
      targetEntityId: info.parentEntityId,
      relationKey: info.relationKey || info.entityId,
      relationType: info.relationType,
    };
  } catch (error) {
    console.log("Error while initializing relation config:", error);
  } finally {
    isLoading.value = false;
  }
};

const onSave = async ({
  saveEmptyMetadata = false,
}: {
  saveEmptyMetadata: boolean;
}) => {
  const modalInfo = getModalInfo(TypeModals.EntityEditModal);

  if (relationConfig.value) {
    try {
      const formValues =
        getForm(activeFormId.value)?.values?.intialValues || {};
      const success = await saveRelationConfig(
        relationConfig.value.targetEntityId,
        relationConfig.value.relationKey,
        relationConfig.value.relationType,
        formValues,
        modalInfo.callback,
        modalInfo.relationMetadata,
      );
      if (success) handleCloseModal();
    } finally {
      handleCloseModal();
    }
    return;
  }

  if (!currentEntityId.value || !currentEntityType.value) return;

  try {
    const success = await save(
      currentEntityId.value,
      currentEntityType.value,
      modalInfo.callback,
      saveEmptyMetadata,
    );
    if (success) handleCloseModal();
  } finally {
    handleCloseModal()
  }
};

const handleCloseModal = () => {
  if (activeFormId.value) deleteForm(activeFormId.value);
  resetData();
  closeModal(TypeModals.EntityEditModal);
};

const resetData = () => {
  currentEntityId.value = null;
  currentEntityType.value = null;
  formFlow.value = null;
  formTitle.value = "";
  relationConfig.value = null;
  relationFormFields.value = null;
  relationPrefill.value = {};
  currentFormQuery.value = "";
};

watch(
  () => getModalInfo(TypeModals.EntityEditModal).open,
  async (isOpen) => {
    if (isOpen) {
      const info = getModalInfo(TypeModals.EntityEditModal);
      currentEntityId.value = info.entityId;
      currentEntityType.value =
        mapUrlToEntityType(info.entityType) || info.entityType;
      formFlow.value = info.flow;
      formTitle.value = info.title;

      if (info.relationType && info.parentEntityId) {
        await initializeRelationConfig(info);
        return;
      }

      relationConfig.value = null;
      await initialize(
        currentEntityId.value!,
        currentEntityType.value!,
        info.formQuery,
      );

      if (formFlow.value === ContextMenuFormFlow.Removal) {
        onSave({ saveEmptyMetadata: true });
      }
    }
  },
);
</script>
