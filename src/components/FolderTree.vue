<template>
  <div v-for="directory in data?.Directories" :key="directory.id">
    <folder-tree-line
      v-if="data?.Directories && directory && directory.parent === '/'"
      :directory="directory"
      :dictionary="data?.Directories"
      :default-open="true"
    />
  </div>
</template>
<script lang="ts">
  import { defineComponent } from 'vue';
  import FolderTreeLine from './FolderTreeLine.vue';

  export default defineComponent({
    name: 'FolderTree',
    components: {
      FolderTreeLine,
    },
    props: {
      data: {
        type: Array,
        required: true,
      },
    },
    setup() {
    
      return {
      };
    },
  });
</script>
