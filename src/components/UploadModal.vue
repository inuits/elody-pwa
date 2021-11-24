<template>
  <modal
    :large="true"
    :scroll="true"
    :modal-state="uploadModalState.state"
    @hide-modal="closeUploadModal"
  >
    <div class="bg-neutral-20 w-full h-full flex flex-col">
      <upload-modal-import :directories="result" />
    </div>
  </modal>
</template>
<script lang="ts">
  import Modal, { ModalState } from './base/Modal.vue';
  import { defineComponent, ref, watch } from 'vue';
  import UploadModalImport from './UploadModalImport.vue';
  import { useQuery } from '@vue/apollo-composable';
  import { GetDirectoriesDocument, GetDirectoriesQuery } from '@/queries';

  export type UploadModalType = {
    state: ModalState;
  };

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
      const fetchEnabled = ref(false);
      const { result, refetch } = useQuery(
        GetDirectoriesDocument,
        null,
        () => ({
          enabled: fetchEnabled.value,
        }),
      );

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
        uploadModalState,
        closeUploadModal,
        result,
      };
    },
  });
</script>
