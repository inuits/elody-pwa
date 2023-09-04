<template>
  <BaseModal
    :modal-state="getModalInfo(TypeModals.EntityPicker).state"
    :modal-position="getModalInfo(TypeModals.EntityPicker).modalPosition"
    modal-width-style="w-10/12"
    @hide-modal="closeModal(TypeModals.EntityPicker)"
  >
    <div class="flex flex-col w-full h-full overflow-auto py-6">
      <BaseLibrary
        v-if="getModalInfo(TypeModals.EntityPicker).state === ModalState.Show"
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
        :disable-new-entity-previews="true"
        :ids-of-non-selectable-entities="getAlreadySelectedEntityIds()"
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
import { useBaseModal } from "@/composables/useBaseModal";
import { useFormHelper } from "@/composables/useFormHelper";
import { useRoute } from "vue-router";

const { getAcceptedTypes } = useEntityPickerModal();
const { closeModal, getModalInfo } = useBaseModal();
const { getForm } = useFormHelper();

const route = useRoute();

const getAlreadySelectedEntityIds = (): string[] => {
  const id = route.params.id as string;
  const form = getForm(id);
  return form.values.relationValues.relations.map(
    (relation: any) => relation.key
  );
};

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
      label:
        getAcceptedTypes()[0] === Entitytyping.Mediafile
          ? "mediafile"
          : form.values.relationValues.label,
      type:
        getAcceptedTypes()[0] === Entitytyping.Mediafile
          ? "hasMediafile"
          : form.values.relationValues.type,
      value: item.teaserMetadata?.find((data) => data.key === "name")?.value,
      editStatus: EditStatus.New,
      teaserMetadata: item.teaserMetadata?.map((metadata) => {
        return {
          key: metadata.key,
          label: metadata.label,
          value: metadata.value,
        };
      }),
    });
  });

  form.setFieldValue("relationValues.relations", relations);
  closeModal(TypeModals.EntityPicker);
};
</script>
