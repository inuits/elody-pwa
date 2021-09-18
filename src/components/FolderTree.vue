<template>
  <div v-for="directory in result?.Directories" :key="directory.id">
    <folder-tree-line
      v-if="result?.Directories && directory && directory.parent === '/'"
      :directory="directory"
      :dictionary="result?.Directories"
      :default-open="true"
    />
  </div>
</template>
<script lang="ts">
  import { GetDirectoriesDocument } from '@/queries';
  import { useQuery } from '@vue/apollo-composable';
  import { defineComponent } from 'vue';
  import FolderTreeLine from './FolderTreeLine.vue';

  export default defineComponent({
    name: 'FolderTree',
    components: {
      FolderTreeLine,
    },
    setup() {
      const { result } = useQuery(GetDirectoriesDocument);

      return {
        result,
      };
    },
  });
</script>
