<template>
  <modal
    :large="true"
    :scroll="true"
    :modal-state="modalType.state"
    @hide-modal="closeModal"
  >
    <div class="bg-neutral-20 w-full h-full flex flex-col">
      <upload-modal-import />
    </div>
  </modal>
</template>
<script lang="ts">
  import Modal, { ModalState } from './base/Modal.vue';
  import { defineComponent, inject, PropType } from 'vue';
  import UploadModalImport from './UploadModalImport.vue';

  export type UploadModalType = {
    state: ModalState;
  };

  export default defineComponent({
    name: 'UploadModal',
    components: {
      Modal,
      UploadModalImport,
    },
    props: {
      modalType: {
        type: Object as PropType<UploadModalType>,
        required: true,
      },
    },
    setup() {
      const updateUploadModal =
        inject<(UploadModal: UploadModalType) => void | undefined>('updateUploadModal');

      const closeModal = () => {
        updateUploadModal &&
          updateUploadModal({
            state: 'hide',
          });
      };

      return {
        closeModal,
      };
    },
  });
</script>
