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

      <div v-else-if="entity && metadataFields.length > 0">
        <h2 class="title m-0 pb-4">{{ t("modals.entityEdit.title") }}</h2>

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
            label="Update"
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
  save,
  handleManualMetadataUpdate,
} = useEntityEditor();

const currentEntityId = ref<string | null>(null);
const currentEntityType = ref<string | null>(null);
const formFlow = ref<ContextMenuFormFlow | null>(null);
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

const onSave = async ({
  saveEmptyMetadata = false,
}: {
  saveEmptyMetadata: boolean;
}) => {
  if (!currentEntityId.value || !currentEntityType.value) return;

  const modalInfo = getModalInfo(TypeModals.EntityEditModal);
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
