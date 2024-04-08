<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <ul>
        <li v-for="directory in directories" :key="directory.id">
          <folder-tree-line
              :directory="directory"
              :dictionary="directories"
              :default-open="false"
              :selected-directory="selectedDirectory"
              :update-selected-directory="updateSelectedDirectory"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, onMounted } from 'vue';
import { useQuery } from "@vue/apollo-composable";
import { GetDirectoriesDocument } from "@/generated-types/queries";
import { provide } from 'vue';
import FolderTreeLine from "@/components/FolderTreeLine.vue";

const props = defineProps({
  selectedIndex: Number
});

const directories = ref([]);
const loading = ref(false);
const selectedDirectory = ref(null);

let queryResult;

onMounted(() => {
  console.log('Mounted. selectedIndex:', props.selectedIndex);
});

const { onResult } = useQuery(GetDirectoriesDocument, {});

onResult((result) => {
  if (result && result.data && result.data.Directories) {
    directories.value = result.data.Directories;
  }
});

const updateSelectedDirectory = (directory) => {
  selectedDirectory.value = directory;
};

provide('selectedDirectory', selectedDirectory);
provide('updateSelectedDirectory', updateSelectedDirectory);
</script>
