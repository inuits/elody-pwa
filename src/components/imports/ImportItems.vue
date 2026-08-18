<template>
  <div v-if="itemsLoading">
    <spinner-loader theme="accent" />
  </div>
  <div v-else>
    <ul v-if="items.length" class="max-h-[75vh] p-4 overflow-y-auto">
      <li v-for="item in items" :key="item">
        <import-list-item
          :item="item"
          :selected-item="selectedItem"
          @update-selected-item="
            (newSelectedItem: any) => updateSelectedItem(newSelectedItem)
          "
        />
      </li>
    </ul>
    <div v-else class="py-4">
      <p>{{ t("import.no-magazines") }}</p>
    </div>
  </div>
  <div class="import-footer w-full flex justify-end sticky bottom-0 z-10">
    <BaseButton
      button-style="commit"
      :label="t('import.start-import')"
      :disabled="!selectedItem"
      style="width: auto"
      @click="doImport(selectedItem)"
    />
  </div>
</template>

<script setup lang="ts">
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import BaseButton from "@/components/base/BaseButton.vue";
import { ref, onMounted } from "vue";
import { BaseFieldType } from "@/generated-types/queries";
import { useI18n } from "vue-i18n";
import ImportListItem from "@/components/imports/ImportListItem.vue";
import { useBaseNotification } from "@/composables/useBaseNotification";
import { useGraphqlAsync } from "@/composables/useGraphqlAsync";

const props = defineProps<{
  inputFieldType: BaseFieldType;
  closeAndDeleteForm: () => void;
}>();

const { t } = useI18n();
const { displaySuccessNotification, displayErrorNotification } =
  useBaseNotification();
const { getQueryDocument, queryAsync, mutateAsync } = useGraphqlAsync();

const itemsLoading = ref<boolean>(false);
const items = ref<string[]>([]);
const selectedItem = ref<string>("");
const queries = ref<any>();

const initializeImport = async () => {
  queries.value = await getQueryDocument();

  itemsLoading.value = true;
  if (props.inputFieldType === BaseFieldType.BaseMagazineWithMetsImportField) {
    const result = await queryAsync(
      queries.value.GetUploadMagazinesWithMetsDocument,
    );
    if (result && result.data && result.data.UploadMagazinesWithMets)
      items.value = result.data.UploadMagazinesWithMets;
    itemsLoading.value = false;
  }
};

onMounted(() => {
  initializeImport();
});

const doImport = async (item: string) => {
  try {
    switch (props.inputFieldType) {
      case BaseFieldType.BaseMagazineWithMetsImportField:
        await mutateAsync(queries.value.startImportMagazinesWithMets, {
          folder: item,
        });
        break;
      default:
        return;
    }
    displaySuccessNotification(
      t(`notifications.success.import.title`),
      t(`notifications.success.import.description`),
    );
  } catch (error: any) {
    displayErrorNotification(
      t(`notifications.errors.import.title`),
      "" + error.message,
    );
  }
  props.closeAndDeleteForm();
};

const updateSelectedItem = (item: any) => {
  selectedItem.value = item;
};

</script>

<style scoped>
.import-footer {
  padding: var(--spacing-ds-8);
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border-subtle);
}
</style>
