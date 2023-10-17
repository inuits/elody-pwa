<template>
  <BaseModal
    :modal-state="getModalInfo(TypeModals.EntityPicker).state"
    :modal-position="getModalInfo(TypeModals.EntityPicker).modalPosition"
    modal-width-style="w-10/12"
    modal-color="bg-neutral-lightest"
    @hide-modal="
      () => {
        dequeueAllItemsForBulkProcessing(getContext());
        closeModal(TypeModals.EntityPicker);
      }
    "
  >
    <div class="flex flex-col w-full h-full overflow-auto py-6">
      <BaseLibrary
        v-if="getModalInfo(TypeModals.EntityPicker).state === ModalState.Show"
        :bulk-operations-context="getContext()"
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
        :disable-new-entity-previews="true"
        :ids-of-non-selectable-entities="getAlreadySelectedEntityIds()"
        list-item-route-name="SingleEntity"
        @confirm-selection="
          (selectedItems) => {
            addRelations(selectedItems);
            dequeueAllItemsForBulkProcessing(getContext());
            closeModal(TypeModals.EntityPicker);
          }
        "
      />
    </div>
  </BaseModal>
</template>

<script lang="ts" setup>
import {
  Entitytyping,
  ModalState,
  SearchInputType,
  TypeModals,
} from "@/generated-types/queries";
import {
  BulkOperationsContextEnum,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import BaseLibrary from "@/components/library/BaseLibrary.vue";
import BaseModal from "@/components/base/BaseModal.vue";
import useEntityPickerModal from "@/composables/useEntityPickerModal";
import { useBaseModal } from "@/composables/useBaseModal";
import { useFormHelper } from "@/composables/useFormHelper";
import { useRoute } from "vue-router";

const { getAcceptedTypes } = useEntityPickerModal();
const { closeModal, getModalInfo } = useBaseModal();
const { addRelations, getForm } = useFormHelper();
const { dequeueAllItemsForBulkProcessing } = useBulkOperations();

const route = useRoute();

const getAlreadySelectedEntityIds = (): string[] => {
  const id = route.params.id as string;
  const form = getForm(id);
  return form.values.relationValues.relations.map(
    (relation: any) => relation.key
  );
};

const getContext = () => {
  const acceptedTypes = getAcceptedTypes();
  if (acceptedTypes.length > 0) {
    if (acceptedTypes[0] !== Entitytyping.Mediafile) {
      return BulkOperationsContextEnum.EntityElementListEntityPickerModal;
    } else {
      return BulkOperationsContextEnum.EntityElementMediaEntityPickerModal;
    }
  } else {
    return BulkOperationsContextEnum.EntityElementListEntityPickerModal;
  }
};
</script>
