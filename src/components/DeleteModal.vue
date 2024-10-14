<template>
  <BaseModal
    :modal-type="TypeModals.Delete"
    :cancel-button-availabe="numberOfBlockingQueryEntities <= 0"
    modal-color="bg-neutral-lightest"
    @hide-modal="closeModal(TypeModals.Delete)"
  >
    <div
      class="flex flex-col w-full h-full overflow-hidden"
      :class="[{ 'pt-5': numberOfBlockingQueryEntities <= 0 }]"
    >
      <div class="w-full">
        <h1 class="title flex justify-center">
          {{ t("navigation.delete-entity-window") }}
        </h1>
      </div>
      <div
        class="h-full flex flex-col justify-between p-4"
        v-if="modalOpenend && deleteQueryOptions.customQueryBlockingRelations"
        v-show="numberOfBlockingQueryEntities > 0"
      >
        <div class="title p-4">
          {{ t("actions.labels.blocking-relations") }}
        </div>
        <entity-picker-component
          :entity-uuid="parentId"
          :accepted-types="deleteQueryOptions.customQueryBlockingEntityTypes"
          :custom-query="deleteQueryOptions.customQueryBlockingRelations"
          :custom-filters-query="
            deleteQueryOptions.customQueryBlockingRelationsFilters
          "
          :show-button="false"
          :enable-bulk-operations="false"
          :enable-advanced-filters="false"
          base-library-height="h-fit"
          @entities-updated="
            (numberOfEntities) =>
              (numberOfBlockingQueryEntities = numberOfEntities)
          "
          class="mb-5"
        />
      </div>
      <div
        class="h-full flex flex-col justify-between p-4"
        v-if="
          modalOpenend &&
          (!numberOfBlockingQueryEntities || numberOfBlockingQueryEntities <= 0)
        "
      >
        <div v-if="deleteQueryOptions.customQueryDeleteRelations">
          <div class="title pl-4">
            {{ t("actions.labels.delete-relation-entities") }}
          </div>
          <entity-picker-component
            :entity-uuid="parentId"
            :accepted-types="deleteQueryOptions.customQueryEntityTypes"
            :custom-query="deleteQueryOptions.customQueryDeleteRelations"
            :custom-filters-query="
              deleteQueryOptions.customQueryDeleteRelationsFilters
            "
            :show-button="false"
            :enable-bulk-operations="false"
            :enable-advanced-filters="false"
            :enable-non-selectable-entities="false"
            base-library-height="h-fit"
          />
        </div>
        <ConfirmModalView class="h-max"></ConfirmModalView>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import type { ApolloClient } from "@apollo/client/core";
import { useMutation } from "@vue/apollo-composable";
import EntityPickerComponent from "@/components/EntityPickerComponent.vue";
import ConfirmModalView from "@/components/ConfirmModalView.vue";
import { useI18n } from "vue-i18n";
import { ref, watch, inject, computed } from "vue";
import {
  Collection,
  DeleteDataDocument,
  type DeleteDataMutation,
  DeleteQueryOptions,
  Entitytyping,
  TypeModals,
} from "@/generated-types/queries";
import BaseModal from "@/components/base/BaseModal.vue";
import {
  useBaseModal,
} from "@/composables/useBaseModal";
import { useConfirmModal } from "@/composables/useConfirmModal";
import {
  BulkOperationsContextEnum,
  InBulkProcessableItem,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { useEditMode } from "@/composables/useEdit";
import { useRouter } from "vue-router";
import {
  NotificationType,
  useNotification,
} from "@/components/base/BaseNotification.vue";
import { usePageInfo } from "@/composables/usePageInfo";
import useTenant from "@/composables/useTenant";
import { apolloClient } from "@/main";
import { getChildrenOfHomeRoutes } from "@/helpers";
import { useModalActions } from "@/composables/useModalActions";

const { t } = useI18n();
const config: any = inject("config");
const { closeModal, getModalInfo } = useBaseModal();
const { initializeConfirmModal } = useConfirmModal();
const { createNotificationOverwrite } = useNotification();
const { getEnqueuedItems, dequeueAllItemsForBulkProcessing } =
  useBulkOperations();
const {
  getParentId,
  getCallbackFunction,
} = useModalActions();

const { mutate } = useMutation<DeleteDataMutation>(DeleteDataDocument);
const { getTenants } = useTenant(apolloClient as ApolloClient<any>, config);
const router = useRouter();
const { disableEditMode } = useEditMode();
const { pageInfo } = usePageInfo();

const modalOpenend = ref<boolean>(false);
const deleteQueryOptions = ref<DeleteQueryOptions | undefined>(undefined);
const numberOfBlockingQueryEntities = ref<number | undefined>(undefined);
const parentId = computed(() => getParentId());

const deleteSelectedItems = async () => {
  const selectedItems: InBulkProcessableItem[] = getEnqueuedItems(getContext());
  dequeueAllItemsForBulkProcessing(getContext());
  if (selectedItems.length <= 0) return;
  const childRoutes = getChildrenOfHomeRoutes(config).map(
    (route: any) => route.meta
  );
  for (const selectedItem of selectedItems) {
    const id = selectedItem.id;
    let collection;
    if (selectedItem.type.toLowerCase() === Entitytyping.Mediafile) {
      collection = Collection.Mediafiles;
    } else {
      collection = childRoutes.find(
        (route: any) => route.entityType === selectedItem.type
      ).type;
    }
    try {
      await mutate({ id, path: collection, deleteMediafiles: false });
    } catch (e) {
      console.log(e);
    }
  }
};

const cleanupAfterDeletion = async () => {
  await getTenants();
  closeModal(TypeModals.Delete);
  disableEditMode();
  router.push({ name: pageInfo.value.parentRouteName });
  createNotificationOverwrite(
    NotificationType.default,
    t("notifications.success.entityDeleted.title"),
    t("notifications.success.entityDeleted.description")
  );
};

const deleteButtonClicked = async () => {
  await deleteSelectedItems();
  getCallbackFunction()();
  await cleanupAfterDeletion();
};

const getContext = () => {
  if (deleteQueryOptions.value.customQueryEntityTypes.length > 0) {
    if (
      deleteQueryOptions.value.customQueryEntityTypes[0] !==
      Entitytyping.Mediafile
    ) {
      return BulkOperationsContextEnum.EntityElementListEntityPickerModal;
    } else {
      return BulkOperationsContextEnum.EntityElementMediaEntityPickerModal;
    }
  } else {
    return BulkOperationsContextEnum.EntityElementListEntityPickerModal;
  }
};

watch(
  () => getModalInfo(TypeModals.Delete).open,
  async (isDeleteModalOpen: boolean) => {
    modalOpenend.value = isDeleteModalOpen;
    if (!modalOpenend.value) return;
    numberOfBlockingQueryEntities.value = undefined;
    deleteQueryOptions.value = getModalInfo(
      TypeModals.Delete
    ).deleteQueryOptions;
    initializeConfirmModal({
      confirmButton: { buttonCallback: deleteButtonClicked },
      declineButton: {
        buttonCallback: () => {
          closeModal(TypeModals.Delete);
        },
      },
      translationKey: "delete-entity",
      openImmediately: false,
    });
  },
  { immediate: true }
);
</script>

<style scoped></style>
