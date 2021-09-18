<template>
  <div class="flex flex-col w-full my-2 p-5 flex-grow">
    <div class="bg-neutral-0 mb-4 rounded py-5 pl-5 h-full">
      <folder-tree />
    </div>
  </div>
  <div class="w-full flex flex-col sticky bottom-0 p-5 bg-neutral-30 z-10">
    <BaseButton
      bg-color="blue-400"
      txt-color="neutral-0"
      label="Import"
      bg-hover-color="blue-100"
      @click="doImport()"
    />
  </div>
</template>
<script lang="ts">
  import { defineComponent, inject, provide, ref, Ref } from 'vue';
  import FolderTree from './FolderTree.vue';
  import BaseButton from './base/BaseButton.vue';
  import { useMutation } from '@vue/apollo-composable';
  import { Directory, PostStartImportDocument } from '@/queries';

  export default defineComponent({
    name: 'UploadModalImport',
    components: {
      FolderTree,
      BaseButton,
    },
    props: {},
    setup() {
      const { mutate } = useMutation(PostStartImportDocument);

      const selectedDirectory = ref<Directory | undefined>();

      const updateSelectedDirectory = (directory: Directory) => {
        selectedDirectory.value = directory;
      };

      provide<(directory: Directory) => void>(
        'updateSelectedDirectory',
        updateSelectedDirectory,
      );

      provide<Ref<Directory | undefined>>('selectedDirectory', selectedDirectory);

      const doImport = () => {
        console.log(selectedDirectory);
        if (selectedDirectory.value && selectedDirectory.value.id) {
          mutate({
            folder: selectedDirectory.value.id,
          });
        }
      };

      return {
        doImport,
      };
    },
  });
</script>
