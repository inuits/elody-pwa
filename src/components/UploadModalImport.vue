<template>
  <folder-tree :data="directories" />
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
  import { defineComponent, provide, ref, Ref } from 'vue';
  import FolderTree from './FolderTree.vue';
  import BaseButton from './base/BaseButton.vue';
  import { useMutation } from '@vue/apollo-composable';
  import { Directory, PostStartImportDocument } from '@/queries';
  import { useUploadModal } from './UploadModal.vue';

  export default defineComponent({
    name: 'UploadModalImport',
    components: {
      FolderTree,
      BaseButton,
    },
    props: {
      directories: {
        type: Array,
        required: true,
        default: () => [],
      },
    },
    setup() {
      const { mutate } = useMutation(PostStartImportDocument);
      const selectedDirectory = ref<Directory | undefined>();
      const uploadModal = useUploadModal();

      const updateSelectedDirectory = (directory: Directory) => {
        selectedDirectory.value = directory;
      };

      provide<(directory: Directory) => void>(
        'updateSelectedDirectory',
        updateSelectedDirectory,
      );

      provide<Ref<Directory | undefined>>('selectedDirectory', selectedDirectory);

      const doImport = () => {
        if (selectedDirectory.value && selectedDirectory.value.id) {
          mutate({
            folder: selectedDirectory.value.id,
          });
          uploadModal.closeUploadModal();
        }
      };

      return {
        doImport,
      };
    },
  });
</script>
