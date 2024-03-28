<template>
  <div>
    <h2>Import Directories</h2>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <h3>Directories:</h3>
      <ul>
        <li v-for="directory in directories" :key="directory.id">
          <folder-tree-line
            :directory="directory"
            :dictionary="directories"
            :default-open="false"
          />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, watchEffect } from 'vue';
import FolderTreeLine from '@/components/FolderTreeLine.vue';

const props = defineProps({
  selectedIndex: Number,
});

const directories = ref([]);
const loading = ref(false);

const fetchDirectories = async () => {
  loading.value = true;
  try {
    const response = await fetch(`http://filesystem-importer-service.coghent-dams.localhost:8000/import/list-directories`);
    if (response.ok) {
      directories.value = await response.json();
    } else {
      console.error('Failed to fetch directories:', response.statusText);
    }
  } catch (error) {
    console.error('Error fetching directories:', error);
  } finally {
    loading.value = false;
  }
};

watchEffect(() => {
  if (props.selectedIndex === 1) {
    fetchDirectories();
  }
});
</script>
