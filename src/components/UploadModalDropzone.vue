<template>
  <div class="p-3 h-full">
    <dropzone v-model:progress="progress" />
  </div>
</template>
<script lang="ts">
  import { defineComponent, inject, provide, ref, Ref, watch } from 'vue';
  import { useMutation } from '@vue/apollo-composable';
  import { Directory, PostStartImportDocument } from '@/queries';
  import { UploadModalType, useUploadModal } from './UploadModal.vue';
  import Dropzone from './Dropzone.vue';
  import useDropzoneHelper from '@/composables/useDropzoneHelper';
  const { clearDropzoneErrorMessages, clearDropzoneCounters } = useDropzoneHelper();

  export default defineComponent({
    name: 'UploadModalImport',
    components: {
      Dropzone,
    },
    props: {
      directories: {
        type: Array,
        required: true,
      },
      hasDropzone: Boolean
    },
    setup() {
      const { mutate } = useMutation(PostStartImportDocument);
      const selectedDirectory = ref<Directory | undefined>();
      const uploadModal = useUploadModal();
      const { uploadModalState } = useUploadModal();

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

      watch(
      () => uploadModalState.value.state,
      () => {
        clearDropzoneCounters();
        clearDropzoneErrorMessages();
      });

      return {
        doImport,
        progress,
      };
    },
  });
</script>
