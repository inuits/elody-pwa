<template>
  <BaseModal
    :modal-state="modal.modalState.value.state"
    modal-position="right"
    modal-width-style="w-10/12"
    @hide-modal="modal.closeModal()"
  >
    <div class="flex flex-col w-full h-full overflow-auto py-6">
      <BaseLibrary
        v-if="
          getModal(TypeModals.EntityPicker).modalState.value.state ===
          ModalState.Show
        "
        :bulk-operations-context="
          getAcceptedTypes().length > 0
            ? getAcceptedTypes()[0] !== Entitytyping.Mediafile
              ? BulkOperationsContextEnum.EntityElementListEntityPickerModal
              : BulkOperationsContextEnum.EntityElementMediaEntityPickerModal
            : BulkOperationsContextEnum.EntityElementListEntityPickerModal
        "
        :search-input-type-on-drawer="
          getAcceptedTypes().length > 0
            ? getAcceptedTypes()[0] !== Entitytyping.Mediafile
              ? SearchInputType.AdvancedInputType
              : SearchInputType.AdvancedInputMediaFilesType
            : SearchInputType.AdvancedInputType
        "
        :filter-type="
          getAcceptedTypes().length > 0
            ? String(getAcceptedTypes()[0])
            : undefined
        "
        :confirm-selection-button="true"
        :enable-navigation="false"
        list-item-route-name="SingleEntity"
        @confirm-selection="(selectedItems) => addRelations(selectedItems)"
      />
    </div>
  </BaseModal>
</template>

<script lang="ts" setup>
import {
  EditStatus,
  Entitytyping,
  ModalState,
  SearchInputType,
  TypeModals,
  type BaseRelationValuesInput,
} from "@/generated-types/queries";
import {
  BulkOperationsContextEnum,
  type InBulkProcessableItem,
} from "@/composables/useBulkOperations";
import BaseLibrary from "@/components/library/BaseLibrary.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import useEntityPickerModal from "@/composables/useEntityPickerModal";
import { useAvailableModals } from "@/composables/useAvailableModals";
import { useFormHelper } from "@/composables/useFormHelper";
import { useRoute } from "vue-router";

const { getAcceptedTypes } = useEntityPickerModal();
const { getModal } = useAvailableModals();
const { getForm } = useFormHelper();

const modal = getModal(TypeModals.EntityPicker);
const route = useRoute();

const addRelations = (selectedItems: InBulkProcessableItem[]) => {
  const id = route.params.id as string;
  const form = getForm(id);
  if (selectedItems.length <= 0 || !form) return;

  const relations: BaseRelationValuesInput[] =
    form.values.relationValues.relations.filter(
      (relation: BaseRelationValuesInput) =>
        relation.editStatus !== EditStatus.New
    );
  selectedItems.forEach((item) => {
    relations.push({
      key: item.id,
      label: form.values.relationValues.label,
      type: form.values.relationValues.type,
      value: item.teaserMetadata?.find((data) => data.key === "name")?.value,
      editStatus: EditStatus.New,
    });
  });

  form.setFieldValue("relationValues.relations", relations);
  modal.closeModal();
};
</script>
