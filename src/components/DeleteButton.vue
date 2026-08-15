<template>
  <div v-if="deleteAvailable" data-cy="edit-toggle" class="ml-2 mr-6">
    <BaseButton
      :label="t('bulk-operations.delete')"
      :icon="DamsIcons.Trash"
      button-style="danger"
      button-size="sm"
      :loading="isDeleting"
      @click="openDeleteModal()"
    />
  </div>
</template>

<script lang="ts" setup>
import BaseButton from "@/components/base/BaseButton.vue";
import { useI18n } from "vue-i18n";
import { inject, computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { DamsIcons, ModalStyle, TypeModals } from "@/generated-types/queries";
import type { ApolloClient } from "@apollo/client/core";
import { useEditMode } from "@/composables/useEdit";
import { getTitleOrNameFromEntity, mapUrlToEntityType } from "@/helpers";
import { usePageInfo } from "@/composables/usePageInfo";
import { useBaseModal } from "@/composables/useBaseModal";
import { useBulkOperations } from "@/composables/useBulkOperations";
import useTenant from "@/composables/useTenant";
import { apolloClient } from "@/main";
import { useModalActions } from "@/composables/useModalActions";
import { useConfirmModal } from "@/composables/useConfirmModal";
import { useDeleteEntities } from "@/composables/useDeleteEntities";
import { useFormHelper } from "@/composables/useFormHelper";
import { useBaseNotification } from "@/composables/useBaseNotification";
import useEntitySingle from "@/composables/useEntitySingle";
import { useBreadcrumbs } from "@/composables/useBreadcrumbs";
import { useAsyncAction } from "@/composables/useAsyncAction";

const config: any = inject("config");
const entityFormData: any = inject("entityFormData");
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const entityId = computed<string>(
  () =>
    entityFormData?.id ||
    useEntitySingle().getEntityUuid() ||
    route.params["id"],
);
const { getTenants } = useTenant(apolloClient as ApolloClient<any>, config);
const { displaySuccessNotification } = useBaseNotification();
const { pageInfo, previousPageInfo, cleanupPreviousPageInfoById } =
  usePageInfo();
const useEditHelper = computed(() => useEditMode(entityId.value));
const { dequeueItemForBulkProcessing } = useBulkOperations();
const { closeModal, openModal, deleteQueryOptions } = useBaseModal();
const { initializeGeneralProperties, initializePropertiesForDeletion } =
  useModalActions();
const { confirm } = useConfirmModal();
const { deleteEntities } = useDeleteEntities();
const { getForm } = useFormHelper();
const { previousRoute } = useBreadcrumbs({});
const { isBusy: isDeleting, run } = useAsyncAction();

const deleteAvailable = computed<boolean>(
  () =>
    useEditHelper.value.editMode === "edit-delete" ||
    useEditHelper.value.editMode === "delete",
);

const entityType = computed(() => {
  const slug = String(route.params["type"]);
  return mapUrlToEntityType(slug) || slug;
});

const deleteEntity = (deleteMediafiles: boolean = false) =>
  run(async () => {
    const id = entityId.value;
    const type = entityType.value;
    const context = previousPageInfo.value.parentRouteName;

    if (context) dequeueItemForBulkProcessing(context, id);

    const isDeleted = await deleteEntities([{ id, type }], {
      deleteMediafiles,
    });

    if (isDeleted) {
      await getTenants();
      closeModal(TypeModals.Confirm);
      useEditHelper.value.disableEdit();

      cleanupPreviousPageInfoById(id);

      const parent = pageInfo.value.parentRouteName;
      if (!parent && previousRoute.value) {
        router.push({ name: previousRoute.value.overviewPage });
      } else if (parent === "SingleEntity") {
        router.push({ path: previousPageInfo.value.fullPath });
      } else if (parent) {
        router.push({ name: parent });
      } else {
        router.push({ path: "/" });
      }

      displaySuccessNotification(
        t("notifications.success.entityDeleted.title"),
        t("notifications.success.entityDeleted.description"),
      );
    }
  });

const openDeleteModal = async () => {
  const form = getForm(entityId.value);
  const title = getTitleOrNameFromEntity(form.values);

  if (deleteQueryOptions.value) {
    initializeGeneralProperties(
      form.values.uuid,
      undefined,
      route.meta.type,
      [deleteEntity],
      undefined,
    );
    initializePropertiesForDeletion(title);
    openModal(
      TypeModals.Delete,
      ModalStyle.CenterWide,
      undefined,
      deleteQueryOptions,
    );
  } else {
    const choice = await confirm({
      title: t("confirm.delete-entity.title", [entityType.value]),
      message: t("confirm.delete-entity.message", [
        `${entityType.value} '${title}'`,
      ]),
      confirmLabel: t("confirm.delete-entity.confirm", [entityType.value]),
      cancelLabel: t("confirm.delete-entity.cancel"),
    });
    if (choice !== "confirm") return;
    await deleteEntity();
  }
};
</script>

<style scoped></style>
