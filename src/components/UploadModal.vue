<template>
  <modal
    :large="true"
    :scroll="true"
    :modal-state="uploadModalState.state"
    @hide-modal="closeUploadModal"
  >
    <div class="bg-neutral-20 w-full h-full flex flex-col">
      <upload-modal-import />
    </div>
  </modal>
</template>
<script lang="ts">
  import Modal, { ModalState } from './base/Modal.vue';
  import { defineComponent, inject, PropType, provide, ref } from 'vue';
  import UploadModalImport from './UploadModalImport.vue';

  export type UploadModalType = {
    state: ModalState;
  };

  export const uploadModalState = ref<UploadModalType>({
    state: 'hide',
  });

  export const useUploadModal = () => {
    const updateUploadModal = (uploadModalInput: UploadModalType) => {
      uploadModalState.value = uploadModalInput;
    };

    const closeUploadModal = () => {
      updateUploadModal({
        state: 'hide',
      });
    };

    const openUploadModal = () => {
      updateUploadModal({
        state: 'show',
      });
    };

    return {
      closeUploadModal,
      openUploadModal,
      uploadModalState,
    };
  };

  export default defineComponent({
    name: 'UploadModal',
    components: {
      Modal,
      UploadModalImport,
    },
    setup() {
      const { closeUploadModal, uploadModalState } = useUploadModal();

      return {
        uploadModalState,
        closeUploadModal,
      };
    },
  });
</script>
