<template>
  <div
    data-cy="edit-toggle"
    v-if="
      isEditToggleVisible === 'edit' || isEditToggleVisible === 'edit-delete'
    "
    class="mx-6"
  >
    <base-button-new
      v-if="!editMetadataBtnClicked"
      :label="t('metadata.labels.edit-metadata')"
      icon="Edit"
      button-style="accentAccent"
      @click="clickEditMetadataButton()"
    />
    <base-button-new
      v-else
      :label="t('metadata.labels.editing-metadata')"
      :disabled="true"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue";
import useRouteHelpers from "@/composables/useRouteHelpers";
import { useRoute, useRouter } from "vue-router";
import { asString } from "@/helpers";
import { useMutation } from "@vue/apollo-composable";
import { DeleteDataDocument, Collection } from "@/generated-types/queries";
import type { DeleteDataMutation } from "@/generated-types/queries";
import { usePageInfo } from "@/composables/usePageInfo";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import { useI18n } from "vue-i18n";
import useEditMode from "@/composables/useEdit";

const {
  isEdit,
  disableEditMode,
  setEditMode,
  hideEditToggle,
  isEditToggleVisible,
} = useEditMode();
const { isSingle } = useRouteHelpers();
const { pageInfo } = usePageInfo();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { mutate } = useMutation<DeleteDataMutation>(DeleteDataDocument);

const editMetadataBtnClicked = ref<boolean>(false);

const clickEditMetadataButton = () => {
  editMetadataBtnClicked.value = true;
  setEditMode();
}

const deleteAsset = async () => {
  const id = asString(route.params["id"]);
  const collection: Collection = pageInfo.value.routeType as Collection;
  await mutate({ id, path: collection });
  disableEditMode();
  router.push({ name: pageInfo.value.parentRouteName });
};

watch(isEdit, (value: boolean) => {
  editMetadataBtnClicked.value = value;
});
watch(isSingle, (value: boolean) => {
  if (value === false) {
    hideEditToggle();
  }
});
</script>

<style scoped></style>