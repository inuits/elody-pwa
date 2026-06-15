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

      <div v-else-if="(entity || relationConfig) && metadataFields.length > 0">
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
            @update:metadata="
              (val) => handleManualMetadataUpdate(val, activeFormId)
            "
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
import { gql } from "@apollo/client/core";
import { apolloClient } from "@/main";
import {
  TypeModals,
  PanelType,
  BaseLibraryModes,
  ContextMenuFormFlow,
} from "@/generated-types/queries";
import { useBaseModal } from "@/composables/useBaseModal";
import { useFormHelper } from "@/composables/useFormHelper";
import { useEntityEditor } from "@/composables/useEntityEditor";
import { mapUrlToEntityType, getMetadataFields } from "@/helpers";
import BaseModal from "@/components/base/BaseModal.vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import MetadataWrapper from "@/components/metadata/MetadataWrapper.vue";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";

const { t } = useI18n();
const { closeModal, getModalInfo } = useBaseModal();
const { deleteForm } = useFormHelper();
const {
  entity,
  editableFields,
  isLoading,
  isSaving,
  form,
  initialize,
  initializeWithFields,
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

const ProcessorConfigFormDocument = gql`
  query ProcessorConfigForm($id: String!) {
    ProcessorConfigForm(id: $id)
  }
`;

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
    const { data } = await apolloClient.query({
      query: ProcessorConfigFormDocument,
      variables: { id: info.entityId },
      fetchPolicy: "no-cache",
    });
    const fields = Object.values(data?.ProcessorConfigForm || {}).filter(
      (f: any) => f?.inputField,
    ) as any[];
    const prefill: Record<string, any> = {};
    (info.relationMetadata || []).forEach((m: any) => {
      prefill[m.key] = m.value;
    });
    relationConfig.value = {
      targetEntityId: info.parentEntityId,
      relationKey: info.relationKey || info.entityId,
      relationType: info.relationType,
    };
    initializeWithFields(activeFormId.value, fields, prefill);
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
      const success = await saveRelationConfig(
        relationConfig.value.targetEntityId,
        relationConfig.value.relationKey,
        relationConfig.value.relationType,
        modalInfo.callback,
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
