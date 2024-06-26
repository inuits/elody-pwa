<template>
  <BaseModal
    :modal-state="getModalInfo(TypeModals.Delete).state"
    :modal-position="getModalInfo(TypeModals.Delete).modalPosition"
    modal-width-style="w-10/12"
    modal-height-style="my-[15vh]"
    modal-color="bg-neutral-lightest"
    @hide-modal="closeModal(TypeModals.Delete)"
  >
    <div class="w-full">
      <h1 class="title flex justify-center">
        {{ t("navigation.delete-entity-window") }}
      </h1>
    </div>
    <div
      class="h-full flex flex-col justify-between p-4"
      v-if="modalOpenend"
    >
      <div class="title p-4">
        {{ t("actions.labels.delete-relation-entities") }}
      </div>
      <entity-picker-component
        :entity-uuid="savedContext.parentId"
        :accepted-types="[Entitytyping.Mediafile]"
        :custom-query="deleteQueryOptions.customQueryDeleteRelations"
        :custom-filters-query="deleteQueryOptions.customQueryDeleteRelationsFilters"
        :relation-type="deleteQueryOptions.customQueryRelationType"
        @delete-selected-items="
          async (selectedItems: InBulkProcessableItem[]) =>
            await deleteSelectedItems(selectedItems)
        "
        class="mb-5"
      />
      <ConfirmModalView></ConfirmModalView>
    </div>
  </BaseModal>
</template>


<script setup lang="ts">
import type { ApolloClient } from "@apollo/client/core";
import EntityPickerComponent from "@/components/EntityPickerComponent.vue";
import ConfirmModalView from "@/components/ConfirmModalView.vue";
import { useI18n } from "vue-i18n";
import { ref, watch, inject } from "vue";
import {
  Collection,
  DeleteQueryOptions,
  Entitytyping,
  ModalState,
  TypeModals,
} from "@/generated-types/queries";
import BaseModal from "@/components/base/BaseModal.vue";
import { GenericContextForModals, useBaseModal } from "@/composables/useBaseModal";
import { useConfirmModal } from "@/composables/useConfirmModal";
import type { InBulkProcessableItem } from "@/composables/useBulkOperations";
import { useBreadcrumbs } from "@/composables/useBreadcrumbs";
import { useEditMode } from "@/composables/useEdit";
import { useRouter } from "vue-router";
import { NotificationType, useNotification } from "@/components/base/BaseNotification.vue";
import { usePageInfo } from "@/composables/usePageInfo";
import useTenant from "@/composables/useTenant";
import { apolloClient } from "@/main";

const { t } = useI18n();
const config: any = inject("config");
const { findLastOverviewPage } = useBreadcrumbs(config, t);
const { closeModal, getModalInfo } = useBaseModal();
const { initializeConfirmModal } = useConfirmModal();
const { createNotificationOverwrite } = useNotification();

const { getTenants } = useTenant(apolloClient as ApolloClient<any>, config);
const router = useRouter();
const { disableEditMode } = useEditMode();
const { pageInfo } = usePageInfo();
const modalOpenend = ref<boolean>(false);
const deleteQueryOptions = ref<DeleteQueryOptions | undefined>(undefined);
const savedContext = ref<GenericContextForModals | undefined>(undefined);

const deleteSelectedItems = async (selectedItems: InBulkProcessableItem[]) => {
//   const childRoutes = config.routerConfig[0].children.map(
//     (route: any) => route.meta
//   );
//   for (const selectedItem of selectedItems) {
//     const id = selectedItems.id;
//     let collection;
//     if (selectedItem.type.toLowerCase() === Entitytyping.Mediafile) {
//       collection = Collection.Mediafiles;
//     }
//     else {
//       collection = childRoutes.find(
//         (route: any) => route.entityType === selectedItem.type
//       ).type;
//     }
//     // Call to delete entity/mediafile
//   }
//   await getTenants();
//   closeModal(TypeModals.Confirm);
//   disableEditMode();
//   const lastOverviewPage = findLastOverviewPage();
//   if (lastOverviewPage !== undefined) router.push(lastOverviewPage.path);
//   else router.push({ name: pageInfo.value.parentRouteName });
//   createNotificationOverwrite(
//     NotificationType.default,
//     t("notifications.success.entityDeleted.title"),
//     t("notifications.success.entityDeleted.description")
//   );
}

watch(
  () => getModalInfo(TypeModals.Delete).state,
  async () => {
    modalOpenend.value = getModalInfo(TypeModals.Delete).state === ModalState.Show;
    if (modalOpenend.value) {
      deleteQueryOptions.value = getModalInfo(TypeModals.Delete).deleteQueryOptions;
      savedContext.value = getModalInfo(TypeModals.Delete).savedContext;
    }
    initializeConfirmModal({
      confirmButton: { buttonCallback: savedContext.value?.callbackFunction },
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