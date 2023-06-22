<template>
  <div>
    <div v-if="isEdit" class="flex justify-center relative w-full p-5 z-20">
      <BulkOperationsSubmitBar
        :button-label="$t('bulk-operations.save')"
        :button-icon="DamsIcons.Save"
        @submit="save()"
        @cancel="discard()"
        @delete="showConfirmation"
      />
    </div>

    <ConfirmationModal
      v-show="confirmState === 'show'"
      v-model:confirmState="confirmState"
      :function="deleteAsset"
    />
  </div>
</template>

<script lang="ts" setup>
import {
  DamsIcons,
  DeleteDataDocument,
  type Collection,
  type DeleteDataMutation,
} from "@/generated-types/queries";
import BulkOperationsSubmitBar from "@/components/bulk-operations/BulkOperationsSubmitBar.vue";
import ConfirmationModal from "@/components/base/ConfirmationModal.vue";
import { asString } from "@/helpers";
import { ref } from "vue";
import { useEditMode } from "@/composables/useEdit";
import { useMutation } from "@vue/apollo-composable";
import { usePageInfo } from "@/composables/usePageInfo";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const { pageInfo } = usePageInfo();
const { isEdit, save, discard, disableEditMode } = useEditMode();
const confirmState = ref<"hidden" | "show">("hidden");

const { mutate } = useMutation<DeleteDataMutation>(DeleteDataDocument);
const deleteAsset = async () => {
  const id = asString(route.params["id"]);
  const collection: Collection = pageInfo.value.routeType as Collection;
  await mutate({ id, path: collection });
  disableEditMode();
  router.push({ name: pageInfo.value.parentRouteName });
};

const showConfirmation = () => {
  confirmState.value = confirmState.value === "show" ? "hidden" : "show";
};
</script>
