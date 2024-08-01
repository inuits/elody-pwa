<template>
  <BaseModal
    :modal-type="TypeModals.EntityPicker"
    :cancel-button-availabe="false"
    modal-width-style="w-10/12"
    modal-height-style="h-screen"
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
          {{ entityPickerModal?.open }}
          {{ queryLoaded }}
          {{ ignoreCustomQuery }}
          <BaseLibrary
            v-if="
              getModalInfo(TypeModals.EntityPicker).open &&
              (queryLoaded || ignoreCustomQuery)
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
            :use-other-query="newQuery"
            :ids-of-non-selectable-entities="getAlreadySelectedEntityIds()"
            list-item-route-name="SingleEntity"
            @confirm-selection="
              async (selectedItems) => {
                addRelations(
                  selectedItems,
                  getRelationType(),
                  getEntityUuid(),
                  true
                );
                dequeueAllItemsForBulkProcessing(getContext());
                save();
                closeModal(TypeModals.EntityPicker);
              }
            "
          />
        </BaseTab>
        <BaseTab :title="tabs[1]">
          <dynamic-form
            class="overflow-auto"
            v-if="entityPickerModalOpen"
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
  Entitytyping,
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
import { useEditMode } from "@/composables/useEdit";
import { watch, ref, computed } from "vue";
import { useCustomQuery } from "@/composables/useCustomQuery";

const { t } = useI18n();
const {
  getAcceptedTypes,
  getEntityUuid,
  getRelationType,
  getCustomGetEntitiesQuery,
  getCustomGetEntitiesFiltersQuery,
} = useEntityPickerModal();
const { closeModal, getModalInfo } = useBaseModal();
const { addRelations, getForm } = useFormHelper();
const { dequeueAllItemsForBulkProcessing } = useBulkOperations();
const tabs: string[] = [t("entity.pick"), t("entity.upload")];
const { save } = useEditMode();
const ignoreCustomQuery = ref<boolean>(false);
const newQuery = ref<object | undefined>(undefined);
const { loadDocument, getDocument } = useCustomQuery();
const queryLoaded = ref<boolean>(false);
const entityPickerModalOpen = computed(
  () => getModalInfo(TypeModals.EntityPicker).open
);

const getCustomQuery = async () => {
  await loadDocument(
    getCustomGetEntitiesQuery(),
    getCustomGetEntitiesFiltersQuery()
  );
  newQuery.value = getDocument();
  queryLoaded.value = true;
};

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

watch(
  () => entityPickerModalOpen.value,
  async (isModalOpened: boolean | undefined) => {
    const hasCustomQuery = !!getCustomGetEntitiesQuery();
    console.log(entityPickerModal.value);
    console.log(isModalOpened, hasCustomQuery, newQuery.value);
    if (isModalOpened && hasCustomQuery && !newQuery.value) {
      await getCustomQuery();
    } else if (isModalOpened && !hasCustomQuery) {
      ignoreCustomQuery.value = true;
    }
  },
  { immediate: true }
);
</script>
