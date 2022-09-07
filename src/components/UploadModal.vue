<template>
  <modal
    :large="true"
    :scroll="false"
    :modal-state="uploadModalState.state"
    @hide-modal="closeUploadModal"
  >
    <div class="bg-neutral-20 w-full h-full flex flex-col overflow-auto">
      <upload-modal-import v-if="modalToOpen === modalChoices.IMPORT" :directories="result" />
      <tabs v-if="modalToOpen === modalChoices.DROPZONE">
        <tab title="Upload files">
          <div class="p-3 h-full">
            <upload-modal-dropzone v-if="modalToOpen === modalChoices.DROPZONE" />
          </div>
        </tab>
        <tab title="Select file">
          <div class="p-3 h-full">
            <MediaFileLibrary :enable-selection="true" />
          </div>
        </tab>
      </tabs>
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
  import Tabs from './Tabs.vue';
  import Tab from './Tab.vue';
  import MediaFileLibrary from '@/components/MediaFileLibrary.vue';

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
      UploadModalDropzone,
      Tabs,
      Tab,
      MediaFileLibrary
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
        if (modalToOpen.value === modalChoices.IMPORT) {
          if (fetchEnabled.value === true) {
            refetch();
          } else fetchEnabled.value = true;
        }
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
