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
    <div class="flex flex-col w-full h-full overflow-auto">
      <BaseTabs class="h-full">
        <BaseTab :title="t('entity.pick')">
          <BaseLibrary
            v-if="
              getModalInfo(TypeModals.EntityPicker).state === ModalState.Show
            "
            :bulk-operations-context="getContext()"
            :search-input-type-on-drawer="
              getAcceptedTypes().length > 0
                ? getAcceptedTypes()[0] !== Entitytyping.Mediafile
                  ? SearchInputType.AdvancedInputType
                  : SearchInputType.AdvancedInputMediaFilesType
                : SearchInputType.AdvancedInputType
            "
            :confirm-selection-button="true"
            :enable-navigation="false"
            :disable-new-entity-previews="true"
            :ids-of-non-selectable-entities="getAlreadySelectedEntityIds()"
            :filters="[
              {
                type: AdvancedFilterTypes.Selection,
                parent_key: '',
                key: 'type',
                value: getAcceptedTypes(),
                match_exact: true,
              },
            ]"
            list-item-route-name="SingleEntity"
            @confirm-selection="
              (selectedItems) => {
                addRelations(selectedItems, getRelationType());
                dequeueAllItemsForBulkProcessing(getContext());
                closeModal(TypeModals.EntityPicker);
              }
            "
          />
        </BaseTab>
        <BaseTab :title="t('entity.upload')">
          <dynamic-form
            v-if="
              getModalInfo(TypeModals.EntityPicker).state === ModalState.Show
            "
            dynamic-form-query="GetSingleEntityUploadForm"
            :has-linked-upload="true"
          />
        </BaseTab>
      </BaseTabs>
    </div>
  </BaseModal>
</template>

<script lang="ts" setup>
import {
  AdvancedFilterTypes,
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
import BaseTab from "@/components/BaseTab.vue";
import BaseTabs from "@/components/BaseTabs.vue";
import useEntityPickerModal from "@/composables/useEntityPickerModal";
import { useBaseModal } from "@/composables/useBaseModal";
import { useFormHelper } from "@/composables/useFormHelper";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import dynamicForm from "@/components/dynamicForms/DynamicForm.vue";

const { t } = useI18n();
const { getAcceptedTypes, getRelationType } = useEntityPickerModal();
const { closeModal, getModalInfo } = useBaseModal();
const { addRelations, getForm } = useFormHelper();
const { dequeueAllItemsForBulkProcessing } = useBulkOperations();

const route = useRoute();

const getAlreadySelectedEntityIds = (): string[] => {
  const id = route.params.id as string;
  const form = getForm(id);
  return form.values.relationValues.relations.map(
    (relation: any) => relation.key,
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
