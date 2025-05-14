<template>
  <BaseModal
    :modal-type="TypeModals.Delete"
    :cancel-button-availabe="numberOfBlockingQueryEntities <= 0"
    modal-color="bg-neutral-lightest"
    @hide-modal="closeModal(TypeModals.Delete)"
  >
    <div
      class="flex flex-col w-full h-full"
      :class="[{ 'pt-5': numberOfBlockingQueryEntities <= 0 }]"
    >
      <div class="w-full px-8">
        <h1 class="title flex justify-center px-">
          {{
            t("navigation.delete-entity-window", [
              `${translatedDeleteEntityLabel} "${parentEntityTitle}"`,
            ])
          }}
        </h1>
      </div>
      <div
        class="h-full flex flex-col justify-between p-4"
        v-if="modalOpenend && deleteQueryOptions?.customQueryBlockingRelations"
        v-show="numberOfBlockingQueryEntities > 0"
      >
        <div class="title p-4">
          {{
            t("actions.labels.blocking-relations", [
              translatedDeleteEntityLabel,
              translatedBlockingRelationsLabel,
            ])
          }}
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
        <div
          v-if="deleteQueryOptions?.customQueryDeleteRelations"
          v-show="numberOfRelatedEntities > 0"
        >
          <div class="title pl-4">
            {{
              t("actions.labels.delete-relation-entities", [
                translatedDeleteRelationsLabel,
              ])
            }}
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
            @entities-updated="
              (numberOfEntities) => (numberOfRelatedEntities = numberOfEntities)
            "
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
import EntityPickerComponent from "@/components/EntityPickerComponent.vue";
import ConfirmModalView from "@/components/ConfirmModalView.vue";
import { useI18n } from "vue-i18n";
import { ref, watch, inject, computed } from "vue";
import {
  type DeleteQueryOptions,
  Entitytyping,
  TypeModals,
} from "@/generated-types/queries";
import BaseModal from "@/components/base/BaseModal.vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useConfirmModal } from "@/composables/useConfirmModal";
import {
  BulkOperationsContextEnum,
  type InBulkProcessableItem,
  useBulkOperations,
} from "@/composables/useBulkOperations";
import { useEditMode } from "@/composables/useEdit";
import { useRouter } from "vue-router";
import { useNotification } from "@kyvg/vue3-notification";
import { useBaseNotification } from "@/composables/useBaseNotification";
import { usePageInfo } from "@/composables/usePageInfo";
import useTenant from "@/composables/useTenant";
import { apolloClient } from "@/main";
import { useModalActions } from "@/composables/useModalActions";
import { useDeleteEntities } from "@/composables/useDeleteEntities";

const { t } = useI18n();
const config: any = inject("config");
const { closeModal, getModalInfo } = useBaseModal();
const { initializeConfirmModal } = useConfirmModal();
const { getEnqueuedItems, dequeueAllItemsForBulkProcessing } =
  useBulkOperations();
const { getParentId, getCallbackFunction, getInformationForDelete } =
  useModalActions();
const { getTenants } = useTenant(apolloClient as ApolloClient<any>, config);
const router = useRouter();
const { disableEditMode } = useEditMode();
const { pageInfo, previousPageInfo } = usePageInfo();
const { deleteEntities } = useDeleteEntities();
const { getSuccessNotification } = useBaseNotification();
const { notify } = useNotification();

const modalOpenend = ref<boolean>(false);
const deleteQueryOptions = ref<DeleteQueryOptions | undefined>(undefined);
const numberOfBlockingQueryEntities = ref<number | undefined>(undefined);
const numberOfRelatedEntities = ref<number | undefined>(undefined);
const parentId = computed(() => getParentId());
const parentEntityTitle = ref<string | undefined>(undefined);

const translatedDeleteEntityLabel = ref<string | undefined>(undefined);
const translatedDeleteRelationsLabel = ref<string | undefined>(undefined);
const translatedBlockingRelationsLabel = ref<string | undefined>(undefined);

const deleteSelectedItems = async () => {
  const selectedItems: InBulkProcessableItem[] = getEnqueuedItems(getContext());
  dequeueAllItemsForBulkProcessing(getContext());

  if (selectedItems.length <= 0) return;

  try {
    const isDeleted = await deleteEntities(selectedItems);

    if (isDeleted) {
      notify(
        getSuccessNotification(
          t("notifications.success.itemsDeleted.title"),
          t("notifications.success.itemsDeleted.description"),
        ),
      );
    }
  } catch (error) {
    console.error("Error deleting selected items:", error);
  }
};

const cleanupAfterDeletion = async () => {
  await getTenants();
  closeModal(TypeModals.Delete);
  disableEditMode();

  if (pageInfo.value.parentRouteName !== "SingleEntity")
    router.push({ name: pageInfo.value.parentRouteName });
  else router.push({ path: previousPageInfo.value.fullPath });

  createNotificationOverwrite(
    NotificationType.default,
    t("notifications.success.entityDeleted.title"),
    t("notifications.success.entityDeleted.description"),
  );
};

const deleteButtonClicked = async () => {
  await deleteSelectedItems();
  getCallbackFunction()?.();
  await cleanupAfterDeletion();
};

const getContext = () => {
  const modalContext = getModalInfo(TypeModals.Delete).context;
  if (modalContext) return modalContext;

  if (deleteQueryOptions.value.customQueryEntityTypes?.length > 0) {
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
    parentEntityTitle.value = getInformationForDelete()?.title;
    numberOfBlockingQueryEntities.value = undefined;
    numberOfRelatedEntities.value = undefined;
    deleteQueryOptions.value = getModalInfo(
      TypeModals.Delete,
    ).deleteQueryOptions;
    translatedDeleteEntityLabel.value = t(
      deleteQueryOptions.value?.deleteEntityLabel,
    );
    translatedDeleteRelationsLabel.value = deleteQueryOptions.value
      ?.deleteRelationsLabel
      ? t(deleteQueryOptions.value?.deleteRelationsLabel)
      : undefined;
    translatedBlockingRelationsLabel.value = deleteQueryOptions.value
      ?.blockingRelationsLabel
      ? t(deleteQueryOptions.value?.blockingRelationsLabel)
      : undefined;

    initializeConfirmModal({
      confirmButton: { buttonCallback: deleteButtonClicked },
      declineButton: {
        buttonCallback: () => {
          closeModal(TypeModals.Delete);
        },
      },
      translationKey:
        getModalInfo(TypeModals.Delete).translationKey || "delete-entity",
      openImmediately: false,
      titleLabelVariable: translatedDeleteEntityLabel.value,
      messageLabelVariable: `${translatedDeleteEntityLabel.value} '${getInformationForDelete()?.title}'`,
      confirmLabelVariable: translatedDeleteEntityLabel.value,
    });
  },
  { immediate: true },
);
</script>

<style scoped></style>
