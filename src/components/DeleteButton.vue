<template>
  <div data-cy="edit-toggle" class="ml-2 mr-6">
    <BaseButtonNew
      v-if="deleteAvailable"
      :label="t('bulk-operations.delete')"
      :icon="DamsIcons.Trash"
      button-style="redDefault"
      button-size="small"
      @click="openDeleteModal()"
    />
  </div>
</template>

<script lang="ts" setup>
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
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
const { initializeConfirmModal } = useConfirmModal();
const { deleteEntities } = useDeleteEntities();
const { getForm } = useFormHelper();

const deleteAvailable = ref<boolean>(
  useEditHelper.value.editMode === "edit-delete" ||
    useEditHelper.value.editMode === "delete",
);
watch(
  () => useEditHelper.value,
  () => {
    deleteAvailable.value =
      useEditHelper.value.editMode === "edit-delete" ||
      useEditHelper.value.editMode === "delete";
  },
  { deep: true },
);

const entityType = computed(() => {
  const slug = String(route.params["type"]);
  return mapUrlToEntityType(slug) || slug;
});

const deleteEntity = async (deleteMediafiles: boolean = false) => {
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

    if (pageInfo.value.parentRouteName !== "SingleEntity") {
      router.push({ name: pageInfo.value.parentRouteName });
    } else {
      router.push({ path: previousPageInfo.value.fullPath });
    }

    displaySuccessNotification(
      t("notifications.success.entityDeleted.title"),
      t("notifications.success.entityDeleted.description"),
    );
  }
};

const openDeleteModal = () => {
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
    initializeConfirmModal({
      confirmButton: { buttonCallback: deleteEntity },
      declineButton: {
        buttonCallback: () => {
          closeModal(TypeModals.Confirm);
        },
      },
      translationKey: "delete-entity",
      openImmediately: true,
      titleLabelVariable: entityType.value,
      messageLabelVariable: `${entityType.value} '${title}'`,
      confirmLabelVariable: entityType.value,
    });
  }
};
</script>

<style scoped></style>
