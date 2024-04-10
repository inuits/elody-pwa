<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <ul>
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
    </div>
    <div class="w-full flex flex-col sticky bottom-0 p-5 bg-neutral-30 z-10">
      <button :disabled="!selectedDirectory"
              :class="buttonClass"
              @click="doImport(selectedDirectory?.id)"
      >Import
      </button>
    </div>
  </div>
</template>

<script setup>
import { provide, ref, computed } from 'vue';
import { useMutation, useQuery } from "@vue/apollo-composable";
import { GetDirectoriesDocument, PostStartImportDocument } from "@/generated-types/queries";
import FolderTreeLine from "@/components/FolderTreeLine.vue";
import { useNotification, NotificationType } from "../components/base/BaseNotification.vue";

const directories = ref([]);
const loading = ref(false);
const selectedDirectory = ref(null);
const { createNotificationOverwrite } = useNotification();

const { onResult } = useQuery(GetDirectoriesDocument, {});

onResult((result) => {
  if (result && result.data && result.data.Directories) {
    directories.value = result.data.Directories;
  }
});

const { mutate: startImport } = useMutation(PostStartImportDocument);

const doImport = (folder) => {
  if (!folder) {
    createNotificationOverwrite(NotificationType.error, 'Error', 'Folder ID is required');
    return;
  }

  startImport({ folder })
    .then(() => {
      createNotificationOverwrite(NotificationType.success, 'Success', 'Import successful');
    })
    .catch((error) => {
      createNotificationOverwrite(NotificationType.error, 'Error', 'Error importing: ' + error.message);
    });
};

const buttonClass = computed(() => {
  return {
    'bg-blue-400': selectedDirectory.value,
    'bg-blue-100': !selectedDirectory.value,
    'text-neutral-0': true,
    'px-4 py-2 rounded': true,
    'hover:bg-blue-100': selectedDirectory.value,
  };
});

const updateSelectedDirectory = (directory) => {
  selectedDirectory.value = directory;
};

provide('selectedDirectory', selectedDirectory);
provide('updateSelectedDirectory', updateSelectedDirectory);
</script>
