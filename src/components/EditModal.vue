<template>
  <div>
    <div v-if="isEdit" class="flex justify-center relative w-full p-5 z-20">
      <BulkOperationsSubmitBar
        :button-label="$t('bulk-operations.save')"
        :button-icon="DamsIcons.Save"
        @submit="save()"
        @cancel="discard()"
        @delete="() => modal.openModal()"
      />
    </div>

    <ConfirmModal>
      <div class="flex flex-col justify-between h-full p-4 bg-neutral-white">
        <div>
          <span class="font-bold text-xl text-text-body">
            {{ $t("confirm.sure-message") }}
          </span>
        </div>
        <div>
          <div
            v-if="mediafileSelectionState.mediafiles.length > 0"
            class="flex justify-between"
          >
            <div class="flex gap-4">
              <div>
                <BaseButtonNew
                  class="font-bold"
                  :label="$t('confirm.delete-entity')"
                  :icon="DamsIcons.Trash"
                  button-style="redDefault"
                  button-size="small"
                  @click="deleteEntity()"
                />
              </div>
              <div>
                <BaseButtonNew
                  class="font-bold"
                  :label="$t('confirm.delete-entity-mediafiles')"
                  :icon="DamsIcons.Trash"
                  button-style="redDefault"
                  button-size="small"
                  @click="deleteEntity(true)"
                />
              </div>
            </div>
            <div>
              <BaseButtonNew
                class="font-bold"
                :label="$t('bulk-operations.cancel')"
                button-style="default"
                button-size="small"
                @click="modal.closeModal()"
              />
            </div>
          </div>
          <div v-else class="flex justify-between">
            <div>
              <div>
                <BaseButtonNew
                  class="font-bold"
                  :label="$t('bulk-operations.delete')"
                  :icon="DamsIcons.Trash"
                  button-style="redDefault"
                  button-size="small"
                  @click="deleteEntity()"
                />
              </div>
            </div>
            <div>
              <BaseButtonNew
                class="font-bold"
                :label="$t('bulk-operations.cancel')"
                button-style="default"
                button-size="small"
                @click="modal.closeModal()"
              />
            </div>
          </div>
        </div>
      </div>
    </ConfirmModal>
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
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import BulkOperationsSubmitBar from "@/components/bulk-operations/BulkOperationsSubmitBar.vue";
import ConfirmModal from "@/components/base/ConfirmModal.vue";
import { asString } from "@/helpers";
import { useAvailableModals } from "@/composables/useAvailableModals";
import { useEditMode } from "@/composables/useEdit";
import { useEntityMediafileSelector } from "@/components/EntityImageSelection.vue";
import { useMutation } from "@vue/apollo-composable";
import { usePageInfo } from "@/composables/usePageInfo";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const { pageInfo } = usePageInfo();
const { isEdit, save, discard, disableEditMode } = useEditMode();
const { getModal } = useAvailableModals();
const { mediafileSelectionState } = useEntityMediafileSelector();

const { mutate } = useMutation<DeleteDataMutation>(DeleteDataDocument);
const deleteEntity = async (deleteMediafiles: boolean = false) => {
  const id = asString(route.params["id"]);
  const collection: Collection = pageInfo.value.routeType as Collection;
  await mutate({ id, path: collection, deleteMediafiles });
  modal.closeModal();
  disableEditMode();
  router.push({ name: pageInfo.value.parentRouteName });
};

const modal = getModal(TypeModals.Confirm);
</script>
