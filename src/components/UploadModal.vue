<template>
  <BaseModal
    :large="true"
    :scroll="false"
    :modal-state="uploadModalState.state"
    @hide-modal="closeUploadModal"
  >
    <div class="bg-neutral-20 w-full h-full flex flex-col overflow-auto">
      <BaseTabs v-if="modalToOpen === modalChoices.IMPORT && result">
        <BaseTab :title="$t('upload.import')">
          <upload-modal-import
            v-if="modalToOpen === modalChoices.IMPORT"
            :directories="result.Directories"
          />
        </BaseTab>
        <BaseTab :title="$t('upload.upload-files')">
          <upload-modal-dropzone v-if="modalToOpen === modalChoices.IMPORT" />
        </BaseTab>
      </BaseTabs>
      <BaseTabs v-if="modalToOpen === modalChoices.DROPZONE">
        <BaseTab :title="$t('upload.upload-files')">
          <div class="h-full">
            <upload-modal-dropzone
              v-if="modalToOpen === modalChoices.DROPZONE"
            />
          </div>
        </BaseTab>
        <BaseTab title="Select file">
          <div class="h-full">
            <MediaFileLibrary
              :enable-selection="true"
              @add-selection="addSelection"
            />
          </div>
        </BaseTab>
      </BaseTabs>
    </div>
  </BaseModal>
</template>
<script lang="ts">
import BaseModal from "./base/BaseModal.vue";
import type { ModalState } from "./base/BaseModal.vue";
import { defineComponent, ref, watch } from "vue";
import UploadModalImport from "./UploadModalImport.vue";
import UploadModalDropzone from "./UploadModalDropzone.vue";
import { useQuery } from "@vue/apollo-composable";
import { GetDirectoriesDocument } from "../generated-types/queries";
import BaseTabs from "./BaseTabs.vue";
import BaseTab from "./BaseTab.vue";
import MediaFileLibrary from "./MediaFileLibrary.vue";
import useMetaDataHelper from "../composables/useMetaDataHelper";
import useMediaAssetLinkHelper from "../composables/useMediaAssetLinkHelper";
import useDropzoneHelper from "../composables/useDropzoneHelper";

export type UploadModalType = {
  state: ModalState;
};

export enum modalChoices {
  IMPORT = "IMPORT",
  DROPZONE = "DROPZONE",
}

const modalToOpen = ref<modalChoices>(modalChoices.DROPZONE);

const uploadModalState = ref<UploadModalType>({
  state: "hide",
});

export const useUploadModal = () => {
  const updateUploadModal = (uploadModalInput: UploadModalType) => {
    uploadModalState.value = uploadModalInput;
  };

  const closeUploadModal = () => {
    updateUploadModal({
      state: "hide",
    });
  };

  const openUploadModal = (modal: modalChoices) => {
    modalToOpen.value = modal;
    updateUploadModal({
      state: "show",
    });
    useDropzoneHelper().resetDropzone();
  };

  return {
    closeUploadModal,
    openUploadModal,
    uploadModalState,
    modalToOpen,
  };
};

export default defineComponent({
  name: "UploadModal",
  components: {
    BaseModal,
    UploadModalImport,
    UploadModalDropzone,
    BaseTabs,
    BaseTab,
    MediaFileLibrary,
  },
  setup() {
    const { mediafiles } = useMetaDataHelper();
    const { addMediaFileToLinkList } = useMediaAssetLinkHelper();
    const { closeUploadModal, uploadModalState, modalToOpen } =
      useUploadModal();
    const fetchEnabled = ref(false);
    const { result, refetch } = useQuery(
      GetDirectoriesDocument,
      undefined,
      () => ({
        enabled: fetchEnabled.value,
      })
    );

    watch(
      () => uploadModalState.value.state,
      () => {
        if (uploadModalState.value.state === "show") getData();
      },
      { immediate: true }
    );

    const getData = () => {
      if (modalToOpen.value === modalChoices.IMPORT) {
        if (fetchEnabled.value === true) {
          refetch();
        } else fetchEnabled.value = true;
      }
    };

    const addSelection = (entity: any) => {
      const mediafile = JSON.parse(JSON.stringify(entity.media.mediafiles[0]));
      mediafiles.value.push(mediafile);
      addMediaFileToLinkList(mediafile);
      closeUploadModal();
    };

    return {
      modalChoices,
      modalToOpen,
      uploadModalState,
      closeUploadModal,
      result,
      addSelection,
    };
  },
});
</script>
