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
import { computed, ref, onMounted } from "vue";
import { BaseFieldType } from "@/generated-types/queries";
import { useI18n } from "vue-i18n";
import ImportListItem from "@/components/imports/ImportListItem.vue";
import {
  useNotification,
  NotificationType,
} from "@/components/base/BaseNotification.vue";
import { useGraphqlAsync } from "@/composables/useGraphqlAsync";

const props = defineProps<{
  inputFieldType: BaseFieldType;
  closeAndDeleteForm: Function;
}>();

const { t } = useI18n();
const { createNotificationOverwrite } = useNotification();
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

  if (props.inputFieldType === BaseFieldType.BaseMagazineWithCsvImportField) {
    const result = await queryAsync(
      queries.value.GetUploadMagazinesWithCsvDocument,
    );
    if (result && result.data && result.data.UploadMagazinesWithCsv)
      items.value = result.data.UploadMagazinesWithCsv;
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
      case BaseFieldType.BaseMagazineWithCsvImportField:
        await mutateAsync(queries.value.StartUploadMagazinesWithCsvDocument, {
          folder: item,
        });
        break;
      default:
        return;
    }
    createNotificationOverwrite(
      NotificationType.default,
      "Import",
      t(`import.magazine-import-started`),
    );
  } catch (error) {
    createNotificationOverwrite(
      NotificationType.error,
      t(`import.import-error`),
      "" + error.message,
    );
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
