<template>
  <div class="p-3 h-full">
    <dropzone v-model:progress="progress" />
  </div>
</template>
<script lang="ts">
  const { clearDropzoneErrorMessages, clearDropzoneCounters } = useDropzoneHelper();
  import useDropzoneHelper from '@/composables/useDropzoneHelper';
  import { useUploadModal } from './UploadModal.vue';
  import { defineComponent, ref, watch } from 'vue';
  import Dropzone from './Dropzone.vue';

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

     const progress = ref<any>({
        status: 'new',
        progress: 0,
        successFiles: 0,
        errorFiles: 0,
      });

      const { uploadModalState } = useUploadModal();

      watch(
      () => uploadModalState.value.state,
      () => {
        clearDropzoneCounters();
        clearDropzoneErrorMessages();
      });

      return {
        progress,
      };
    },
  });
</script>
