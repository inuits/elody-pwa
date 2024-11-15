<template>
  <div v-if="isEdit" class="flex justify-center relative w-full p-5 z-20">
    <BulkOperationsSubmitBar
      :button-label="$t('bulk-operations.save')"
      :button-icon="DamsIcons.Save"
      :show-delete-button="isEditToggleVisible === 'edit-delete'"
      :disabled="showErrors"
      @submit="
        async () => {
          clickButton();
          await save();
          await getTenants();
        }
      "
      @cancel="openDiscardModal()"
      @close="openDiscardModal()"
      @delete="openDeleteModal()"
    />
  </div>
</template>

<script lang="ts" setup>
import type { ApolloClient } from "@apollo/client/core";
import {
  Collection,
  DamsIcons,
  DeleteDataDocument,
  type DeleteDataMutation,
  Entitytyping,
  ModalStyle,
  RouteNames,
  TypeModals,
} from "@/generated-types/queries";
import BulkOperationsSubmitBar from "@/components/bulk-operations/BulkOperationsSubmitBar.vue";
import useTenant from "@/composables/useTenant";
import { apolloClient } from "@/main";
import { useI18n } from "vue-i18n";
import { asString, getChildrenOfHomeRoutes } from "@/helpers";
import { inject, computed } from "vue";
import {
  GenericContextForModals,
  useBaseModal,
} from "@/composables/useBaseModal";
import { useConfirmModal } from "@/composables/useConfirmModal";
import { useEditMode } from "@/composables/useEdit";
import { useMutation } from "@vue/apollo-composable";
import { usePageInfo } from "@/composables/usePageInfo";
import { useRoute, useRouter } from "vue-router";
import { useFormHelper } from "@/composables/useFormHelper";
import {
  NotificationType,
  useNotification,
} from "@/components/base/BaseNotification.vue";
import { useBulkOperations } from "@/composables/useBulkOperations";
import { useModalActions } from "@/composables/useModalActions";
import { mapUrlToEntityType } from "@/helpers";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { previousPageInfo } = usePageInfo();
const {
  isEdit,
  save,
  discard,
  disableEditMode,
  showErrors,
  clickButton,
  isEditToggleVisible,
} = useEditMode();
const { initializeGeneralProperties } = useModalActions();
const { initializeConfirmModal } = useConfirmModal();
const { dequeueItemForBulkProcessing } = useBulkOperations();
const { closeModal, openModal, deleteQueryOptions } = useBaseModal();
const { discardEditForForm } = useFormHelper();
const config: any = inject("config");
const { getTenants } = useTenant(apolloClient as ApolloClient<any>, config);
const { createNotificationOverwrite } = useNotification();
const { mutate } = useMutation<DeleteDataMutation>(DeleteDataDocument);

const entityType = computed(() => {
  const slug = String(route.params["type"]);
  return mapUrlToEntityType(slug) || slug;
});

const deleteEntity = async (deleteMediafiles: boolean = false) => {
  const id = asString(route.params["id"]);
  const type = entityType.value;
  const childRoutes = getChildrenOfHomeRoutes(config).map(
    (route: any) => route.meta
  );
  let collection;
  if (type.toLowerCase() === Entitytyping.Mediafile) {
    collection = Collection.Mediafiles;
  } else {
    collection = childRoutes.find(
      (route: any) => route.entityType === type
    ).type;
  }
  const context = previousPageInfo.value.parentRouteName;
  if (context) dequeueItemForBulkProcessing(context, id);
  await mutate({ id, path: collection, deleteMediafiles });
  await getTenants();
  closeModal(TypeModals.Confirm);
  disableEditMode();
  router.push({ name: context ? context : "Home" });
  createNotificationOverwrite(
    NotificationType.default,
    t("notifications.success.entityDeleted.title"),
    t("notifications.success.entityDeleted.description")
  );
};

const openDeleteModal = () => {
  if (deleteQueryOptions.value) {
    initializeGeneralProperties(
      route.params.id,
      undefined,
      route.meta.type,
      deleteEntity,
      undefined
    );
    openModal(
      TypeModals.Delete,
      ModalStyle.Center,
      undefined,
      deleteQueryOptions
    );
  } else {
    initializeConfirmModal({
      confirmButton: { buttonCallback: deleteEntity },
      declineButton: {
        buttonCallback: () => {
          closeModal(TypeModals.Confirm);
        },
      },
      translationKey: "delete-entity",
      openImmediately: true,
    });
  }
};

const openDiscardModal = () => {
  initializeConfirmModal({
    confirmButton: {
      buttonCallback: () => {
        discard();
        const id = asString(route.params["id"]);
        discardEditForForm(id);
        closeModal(TypeModals.Confirm);
      },
    },
    declineButton: {
      buttonCallback: () => {
        closeModal(TypeModals.Confirm);
      },
    },
    translationKey: "discard-edit",
    openImmediately: true,
  });
};
</script>
