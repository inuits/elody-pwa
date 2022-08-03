<template>
  <tabs>
    <!-- TAB1 -->
    <tab title="Upload files">
      <div class="p-3 h-full">
        <dropzone v-model:progress="progress" />
      </div>
    </tab>

    <!-- TAB2 -->
    <tab title="Import from external source">
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
    </tab>
  </tabs>
  
</template>
<script lang="ts">
  import { defineComponent, inject, provide, ref, Ref } from 'vue';
  import FolderTree from './FolderTree.vue';
  import BaseButton from './base/BaseButton.vue';
  import { useMutation } from '@vue/apollo-composable';
  import { Directory, PostStartImportDocument } from '@/queries';
  import { UploadModalType, useUploadModal } from './UploadModal.vue';
  import Tabs from './Tabs.vue';
  import Tab from './Tab.vue';
  import Dropzone from './Dropzone.vue';

  export default defineComponent({
    name: 'UploadModalImport',
    components: {
      FolderTree,
      BaseButton,
      Tabs,
      Tab,
      Dropzone,
    },
    props: {
      directories: {
        type: Array,
        required: true,
      },
    },
    setup() {
      const { mutate } = useMutation(PostStartImportDocument);
      const selectedDirectory = ref<Directory | undefined>();
      const uploadModal = useUploadModal();
      const updateUploadModal =
        inject<(UploadModal: UploadModalType) => void | undefined>('updateUploadModal');

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

     const progress = ref<any>({
        status: 'new',
        progress: 0,
        successFiles: 0,
        errorFiles: 0,
      });

      return {
        doImport,
        progress,
      };
    },
  });
</script>
