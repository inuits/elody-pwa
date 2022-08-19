<template>
  <modal
    :large="true"
    :scroll="true"
    :modal-state="uploadModalState.state"
    @hide-modal="closeUploadModal"
  >
    <div class="bg-neutral-20 w-full h-full flex flex-col">
      <upload-modal-import v-if="modalToOpen === modalChoices.IMPORT" :directories="result" />
      <upload-modal-dropzone v-if="modalToOpen === modalChoices.DROPZONE" :directories="result" />
    </div>
  </modal>
</template>
<script lang="ts">
  import Modal, { ModalState } from './base/Modal.vue';
  import { defineComponent, ref, watch } from 'vue';
  import UploadModalImport from './UploadModalImport.vue';
  import UploadModalDropzone from './UploadModalDropzone.vue';
  import { useQuery } from '@vue/apollo-composable';
  import { GetDirectoriesDocument } from '@/queries';

  export type UploadModalType = {
    state: ModalState;
  };

  enum modalChoices {
  IMPORT = 'IMPORT',
  DROPZONE = 'DROPZONE'
}

  const modalToOpen = ref<modalChoices>(modalChoices.DROPZONE);

  const uploadModalState = ref<UploadModalType>({
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

    const openUploadModal = (modal: modalChoices) => {
      modalToOpen.value = modal;
      updateUploadModal({
        state: 'show',
      });
    };

    return {
      modalChoices,
      closeUploadModal,
      openUploadModal,
      uploadModalState,
      modalToOpen
    };
  };

  export default defineComponent({
    name: 'UploadModal',
    components: {
      Modal,
      UploadModalImport,
      UploadModalDropzone
    },
    setup() {
      const { closeUploadModal, uploadModalState, modalToOpen, modalChoices } = useUploadModal();
      const fetchEnabled = ref(false);
      const { result, refetch } = useQuery(GetDirectoriesDocument, undefined, () => ({
        enabled: fetchEnabled.value,
      }));

      watch(
        () => uploadModalState.value.state,
        () => {
          if (uploadModalState.value.state === 'show') getData();
        },
        { immediate: true },
      );

      const getData = () => {
        if (fetchEnabled.value === true) refetch();
        else fetchEnabled.value = true;
      };

      return {
        modalChoices,
        modalToOpen,
        uploadModalState,
        closeUploadModal,
        result,
      };
    },
  });
</script>
