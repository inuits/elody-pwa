<template>
  <BaseModal
    :modal-state="getModalInfo(TypeModals.Delete).state"
    :modal-position="getModalInfo(TypeModals.Delete).modalPosition"
    :cancel-button-availabe="true"
    modal-width-style="w-10/12"
    modal-color="bg-neutral-lightest"
    @hide-modal="closeModal(TypeModals.Delete)"
  >
    <div class="flex flex-col w-full h-full overflow-hidden">
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
          :entity-uuid="savedContext.parentId"
          :accepted-types="deleteQueryOptions.customQueryBlockingEntityTypes"
          :custom-query="deleteQueryOptions.customQueryBlockingRelations"
          :custom-filters-query="
            deleteQueryOptions.customQueryBlockingRelationsFilters
          "
          :show-button="false"
          :enable-bulk-operations="false"
          :enable-advanced-filters="false"
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
        <div class="title pl-4">
          {{ t("actions.labels.delete-relation-entities") }}
        </div>
        <entity-picker-component
          :entity-uuid="savedContext.parentId"
          :accepted-types="deleteQueryOptions.customQueryEntityTypes"
          :custom-query="deleteQueryOptions.customQueryDeleteRelations"
          :custom-filters-query="
            deleteQueryOptions.customQueryDeleteRelationsFilters
          "
          :show-button="false"
          :enable-bulk-operations="true"
          :enable-advanced-filters="true"
        />
        <ConfirmModalView class="mb-10 h-max"></ConfirmModalView>
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
import { ref, watch, inject } from "vue";
import {
  Collection,
  DeleteDataDocument,
  type DeleteDataMutation,
  DeleteQueryOptions,
  Entitytyping,
  ModalState,
  TypeModals,
} from "@/generated-types/queries";
import BaseModal from "@/components/base/BaseModal.vue";
import {
  GenericContextForModals,
  useBaseModal,
} from "@/composables/useBaseModal";
import { useConfirmModal } from "@/composables/useConfirmModal";
import {
  BulkOperationsContextEnum,
  InBulkProcessableItem,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { useBreadcrumbs } from "@/composables/useBreadcrumbs";
import { useEditMode } from "@/composables/useEdit";
import { useRouter } from "vue-router";
import {
  NotificationType,
  useNotification,
} from "@/components/base/BaseNotification.vue";
import { usePageInfo } from "@/composables/usePageInfo";
import useTenant from "@/composables/useTenant";
import { apolloClient } from "@/main";

const { t } = useI18n();
const config: any = inject("config");
const { findLastOverviewPage } = useBreadcrumbs(config, t);
const { closeModal, getModalInfo } = useBaseModal();
const { initializeConfirmModal } = useConfirmModal();
const { createNotificationOverwrite } = useNotification();
const { getEnqueuedItems, dequeueAllItemsForBulkProcessing } =
  useBulkOperations();

const { mutate } = useMutation<DeleteDataMutation>(DeleteDataDocument);
const { getTenants } = useTenant(apolloClient as ApolloClient<any>, config);
const router = useRouter();
const { disableEditMode } = useEditMode();
const { pageInfo } = usePageInfo();

const modalOpenend = ref<boolean>(false);
const deleteQueryOptions = ref<DeleteQueryOptions | undefined>(undefined);
const savedContext = ref<GenericContextForModals | undefined>(undefined);
const numberOfBlockingQueryEntities = ref<number | undefined>(undefined);

const deleteSelectedItems = async () => {
  const selectedItems: InBulkProcessableItem[] = getEnqueuedItems(getContext());
  dequeueAllItemsForBulkProcessing(getContext());
  if (selectedItems.length <= 0) return;
  const childRoutes = config.routerConfig[0].children.map(
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
  const lastOverviewPage = findLastOverviewPage();
  if (lastOverviewPage !== undefined) router.push(lastOverviewPage.path);
  else router.push({ name: pageInfo.value.parentRouteName });
  createNotificationOverwrite(
    NotificationType.default,
    t("notifications.success.entityDeleted.title"),
    t("notifications.success.entityDeleted.description")
  );
};

const deleteButtonClicked = async () => {
  await deleteSelectedItems();
  savedContext.value?.callbackFunction();
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
  () => getModalInfo(TypeModals.Delete).state,
  async () => {
    modalOpenend.value =
      getModalInfo(TypeModals.Delete).state === ModalState.Show;
    if (!modalOpenend.value) return;
    numberOfBlockingQueryEntities.value = undefined;
    deleteQueryOptions.value = getModalInfo(
      TypeModals.Delete
    ).deleteQueryOptions;
    savedContext.value = getModalInfo(TypeModals.Delete).savedContext;
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
