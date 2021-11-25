<template>
  <div v-for="directory in data?.Directories" :key="directory.id">
    <folder-tree-line
      v-if="data?.Directories && directory && directory.parent === '/'"
      :directory="directory"
      :dictionary="data?.Directories"
      :default-open="false"
    />
  </div>
</template>
<script lang="ts">
  import { Directory } from '@/queries';
import { defineComponent, PropType } from 'vue';
  import FolderTreeLine from './FolderTreeLine.vue';

  export default defineComponent({
    name: 'FolderTree',
    components: {
      FolderTreeLine,
    },
    props: {
      data: {
        type: Object as PropType<Directory[]>,
        required: true,
      },
    },
    setup() {    
    },
  });
</script>
