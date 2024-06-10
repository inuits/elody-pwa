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
    <div class="flex flex-col w-full h-full overflow-hidden">
      <BaseTabs class="h-full" :tabs="tabs">
        <BaseTab :title="tabs[0]" class="overflow-auto">
          <BaseLibrary
            v-if="
              getModalInfo(TypeModals.EntityPicker).state === ModalState.Show
            "
            :bulk-operations-context="getContext()"
            :entity-type="getAcceptedTypes()?.[0]"
            :search-input-type-on-drawer="
              getAcceptedTypes().length > 0
                ? getAcceptedTypes()[0] !== Entitytyping.Mediafile
                  ? SearchInputType.AdvancedInputType
                  : SearchInputType.AdvancedInputMediaFilesType
                : SearchInputType.AdvancedInputType
            "
            :confirm-selection-button="true"
            :enable-navigation="false"
            :enable-bulk-operations="true"
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
                addRelations(
                  selectedItems,
                  getRelationType(),
                  getEntityUuid(),
                  true
                );
                closeModal(TypeModals.EntityPicker);
              }
            "
            :keep-selected-mediafiles="true"
          />
        </BaseTab>
        <BaseTab :title="tabs[1]">
          <dynamic-form
            class="overflow-auto"
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
  type BaseRelationValuesInput,
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
import dynamicForm from "@/components/dynamicForms/DynamicForm.vue";

const { t } = useI18n();
const { getAcceptedTypes, getEntityUuid, getRelationType } =
  useEntityPickerModal();
const { closeModal, getModalInfo } = useBaseModal();
const { addRelations, getForm } = useFormHelper();
const { dequeueAllItemsForBulkProcessing } = useBulkOperations();
const tabs: string[] = [t("entity.pick"), t("entity.upload")];

const getAlreadySelectedEntityIds = (): string[] => {
  const form = getForm(getEntityUuid());
  const relationValues = form?.values.relationValues;
  const normalizedRelationIds = Object.keys(relationValues)
    .filter((relationKey: string) => Array.isArray(relationValues[relationKey]))
    .map((relationKey: string) =>
      relationValues[relationKey].map(
        (relation: BaseRelationValuesInput) => relation
      )
    )
    .flat();

  const filteredRelationIds = normalizedRelationIds
    .filter((relation: BaseRelationValuesInput) => !relation.editStatus)
    .map((relation: BaseRelationValuesInput) => relation.key);

  return filteredRelationIds;
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
