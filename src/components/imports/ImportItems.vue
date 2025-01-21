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
  <div class="w-full flex flex-col sticky bottom-0 p-5 bg-neutral-30 z-10">
    <button
      :disabled="!selectedItem"
      :class="buttonClass"
      @click="doImport(selectedItem)"
    >
      {{ t("import.start-import") }}
    </button>
  </div>
</template>

<script setup lang="ts">
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import { computed, ref } from "vue";
import { useMutation, useQuery } from "@vue/apollo-composable";
import {
  BaseFieldType,
  GetUploadMagazinesWithCsvDocument,
  GetUploadMagazinesWithMetsDocument,
  StartUploadMagazinesWithCsvDocument,
  StartUploadMagazinesWithMetsDocument,
} from "@/generated-types/queries";
import { useI18n } from "vue-i18n";
import ImportListItem from "@/components/imports/ImportListItem.vue";
import { useNotification, NotificationType } from "@/components/base/BaseNotification.vue";

const props = defineProps<{
  inputFieldType: BaseFieldType;
  closeAndDeleteForm: Function;
}>();

const { t } = useI18n();
const { createNotificationOverwrite } = useNotification();

const itemsLoading = ref<boolean>(false);
const items = ref<string[]>([]);
const selectedItem = ref<string>("");

const { mutate: startImportMagazinesWithMets } = useMutation(StartUploadMagazinesWithMetsDocument);
const { mutate: startImportMagazinesWithCsv } = useMutation(StartUploadMagazinesWithCsvDocument);

if (props.inputFieldType === BaseFieldType.BaseMagazineWithMetsImportField) {
  const { onResult, loading } = useQuery(GetUploadMagazinesWithMetsDocument, {});
  onResult((result) => {
    if (result && result.data && result.data.UploadMagazinesWithMets)
      items.value = result.data.UploadMagazinesWithMets;
    itemsLoading.value = loading.value;
  });
}

if (props.inputFieldType === BaseFieldType.BaseMagazineWithCsvImportField) {
  const { onResult, loading } = useQuery(GetUploadMagazinesWithCsvDocument, {});
  onResult((result) => {
    if (result && result.data && result.data.UploadMagazinesWithCsv)
      items.value = result.data.UploadMagazinesWithCsv;
    itemsLoading.value = loading.value;
  });
}

const doImport = async (item: string) => {
  try {
    switch (props.inputFieldType) {
      case BaseFieldType.BaseMagazineWithMetsImportField:
        await startImportMagazinesWithMets({ magazine: item });
        break;
      case BaseFieldType.BaseMagazineWithCsvImportField:
        await startImportMagazinesWithCsv({ folder: item });
        break;
      default:
        return;
    }
    createNotificationOverwrite(
      NotificationType.default,
      "Import",
      t(`import.magazine-import-started`)
    );
  } catch (error) {

  }
  props.closeAndDeleteForm();
};

const updateSelectedItem = (item: any) => {
  selectedItem.value = item;
};

const buttonClass = computed(() => {
  return {
    "bg-accent-accent": selectedItem.value,
    "bg-neutral-100": !selectedItem.value,
    "text-neutral-0": true,
    "px-4 py-2 rounded": true,
    "hover:bg-blue-100": selectedItem.value,
  };
});
</script>

<style scoped></style>