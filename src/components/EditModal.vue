<template>
  <div v-if="isEdit" class="flex justify-center relative w-full p-5 z-20">
    <BulkOperationsSubmitBar
      :button-label="$t('bulk-operations.save')"
      :button-icon="DamsIcons.Save"
      :show-delete-button="true"
      @submit="save()"
      @cancel="openDiscardModal()"
      @delete="openDeleteModal()"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  DamsIcons,
  DeleteDataDocument,
  TypeModals,
  type Collection,
  type DeleteDataMutation,
} from "@/generated-types/queries";
import BulkOperationsSubmitBar from "@/components/bulk-operations/BulkOperationsSubmitBar.vue";
import { asString } from "@/helpers";
import { useBaseModal } from "@/composables/useBaseModal";
import { useEditMode } from "@/composables/useEdit";
import { useEntityMediafileSelector } from "@/composables/useEntityMediafileSelector";
import { useMutation } from "@vue/apollo-composable";
import { usePageInfo } from "@/composables/usePageInfo";
import { useRoute, useRouter } from "vue-router";
import { useConfirmModal } from "@/composables/useConfirmModal";

const route = useRoute();
const router = useRouter();
const { pageInfo } = usePageInfo();
const { isEdit, save, discard, disableEditMode } = useEditMode();
const { setSecondaryConfirmFunction, initializeConfirmModal } =
  useConfirmModal();
const { closeModal, openModal } = useBaseModal();
const { mediafileSelectionState } = useEntityMediafileSelector();

const { mutate } = useMutation<DeleteDataMutation>(DeleteDataDocument);
const deleteEntity = async (deleteMediafiles: boolean = false) => {
  const id = asString(route.params["id"]);
  const collection: Collection = pageInfo.value.routeType as Collection;
  await mutate({ id, path: collection, deleteMediafiles });
  closeModal(TypeModals.Confirm);
  disableEditMode();
  router.push({ name: pageInfo.value.parentRouteName });
};

const openDeleteModal = () => {
  initializeConfirmModal(
    deleteEntity,
    undefined,
    () => closeModal(TypeModals.Confirm),
    "delete-entity"
  );
  if (mediafileSelectionState.mediafiles.length > 0) {
    setSecondaryConfirmFunction(() => deleteEntity(true));
  }
  openModal(TypeModals.Confirm, undefined, "center");
};

const openDiscardModal = () => {
  initializeConfirmModal(
    () => {
      discard();
      closeModal(TypeModals.Confirm);
    },
    undefined,
    () => closeModal(TypeModals.Confirm),
    "discard-edit"
  );
  openModal(TypeModals.Confirm, undefined, "center");
};
</script>
