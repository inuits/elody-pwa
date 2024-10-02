<template>
  <div>
    <div v-if="loading"><spinner-loader theme="accent" /></div>
    <div v-else>
      <ul v-if="directories.length" class="max-h-[75vh] p-4 overflow-y-auto">
        <li v-for="directory in directories" :key="directory.id">
          <folder-tree-line
            :default-open="false"
            :dictionary="directories"
            :directory="directory"
            :selected-directory="selectedDirectory"
            :update-selected-directory="updateSelectedDirectory"
          />
        </li>
      </ul>
      <div v-else class="py-4">
        <p>{{ t("import.no-directories") }}</p>
      </div>
    </div>
    <div class="w-full flex flex-col sticky bottom-0 p-5 bg-neutral-30 z-10">
      <button
        :disabled="!selectedDirectory"
        :class="buttonClass"
        @click="doImport(selectedDirectory?.id)"
      >
        {{ t("import.start-import") }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Entitytyping,
  GetDirectoriesDocument,
  PostStartImportDocument,
} from "@/generated-types/queries";
import {
  useNotification,
  NotificationType,
} from "../components/base/BaseNotification.vue";
import FolderTreeLine from "@/components/FolderTreeLine.vue";
import SpinnerLoader from "@/components/SpinnerLoader.vue";
import useMenuHelper from "@/composables/useMenuHelper";
import { goToEntityTypeRoute } from "@/helpers";
import { provide, ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useMutation, useQuery } from "@vue/apollo-composable";
import { useRouter } from "vue-router";

const props = defineProps<{
  closeAndDeleteForm: Function;
}>();

const { t } = useI18n();
const directories = ref([]);
const selectedDirectory = ref(null);
const { createNotificationOverwrite } = useNotification();
const { getMenuDestinations } = useMenuHelper();
const router = useRouter();

const { onResult, loading } = useQuery(GetDirectoriesDocument, {});

onResult((result) => {
  if (result && result.data && result.data.Directories) {
    directories.value = result.data.Directories;
  }
});

const { mutate: startImport } = useMutation(PostStartImportDocument);

const doImport = (folder) => {
  if (!folder) {
    createNotificationOverwrite(
      NotificationType.error,
      "Error",
      "Folder ID is required"
    );
    return;
  }

  startImport({ folder })
    .then((obj) => {
      if (obj.data.postStartImport.status === 400) {
        const messageId = obj.data.postStartImport.message_id;
        if (messageId === "error-csv-count") {
          const folder = selectedDirectory.value.dir;
          const count = obj.data.postStartImport.count;
          createNotificationOverwrite(
            NotificationType.error,
            t(`import.import-error`),
            t(`import.${messageId}`, { folder, count })
          );
        } else {
          createNotificationOverwrite(
            NotificationType.error,
            t(`import.import-error`),
            t(messageId)
          );
        }
      } else {
        createNotificationOverwrite(
          NotificationType.default,
          "Import",
          t(`import.start-import`)
        );
        goToEntityTypeRoute(
          Entitytyping.Job,
          undefined,
          getMenuDestinations(),
          router
        );
        props.closeAndDeleteForm();
      }
    })
    .catch((error) => {
      createNotificationOverwrite(
        NotificationType.error,
        t(`import.import-error`),
        "" + error.message
      );
    });
};

const buttonClass = computed(() => {
  return {
    "bg-accent-accent": selectedDirectory.value,
    "bg-neutral-100": !selectedDirectory.value,
    "text-neutral-0": true,
    "px-4 py-2 rounded": true,
    "hover:bg-blue-100": selectedDirectory.value,
  };
});

const updateSelectedDirectory = (directory) => {
  selectedDirectory.value = directory;
};

provide("selectedDirectory", selectedDirectory);
provide("updateSelectedDirectory", updateSelectedDirectory);
</script>
