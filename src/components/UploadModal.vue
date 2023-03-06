<template>
  <BaseModal
    :large="true"
    :scroll="false"
    :modal-state="uploadModalState.state"
    @hide-modal="closeUploadModal"
  >
    <div class="w-full h-full flex flex-col overflow-auto">
      <BaseTabs v-if="modalToOpen === modalChoices.IMPORT && result">
        <BaseTab :title="$t('upload.upload-files')">
          <upload-modal-dropzone v-if="modalToOpen === modalChoices.IMPORT" />
        </BaseTab>
        <BaseTab :title="$t('upload.import')">
          <upload-modal-import
            v-if="modalToOpen === modalChoices.IMPORT"
            :directories="result.Directories"
          />
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

<script lang="ts" setup>
import BaseModal from "@/components/base/BaseModal.vue";
import BaseTab from "./BaseTab.vue";
import BaseTabs from "./BaseTabs.vue";
import MediaFileLibrary from "./MediaFileLibrary.vue";
import UploadModalDropzone from "./UploadModalDropzone.vue";
import UploadModalImport from "./UploadModalImport.vue";
import useMediaAssetLinkHelper from "../composables/useMediaAssetLinkHelper";
import useMetaDataHelper from "../composables/useMetaDataHelper";
import useUploadModal, {
  modalChoices,
  uploadModalState,
} from "@/composables/useUploadModal";
import { GetDirectoriesDocument } from "../generated-types/queries";
import { ref, watch } from "vue";
import { useQuery } from "@vue/apollo-composable";

const { addMediaFileToLinkList } = useMediaAssetLinkHelper();
const { mediafiles } = useMetaDataHelper();
const { modalToOpen, closeUploadModal } = useUploadModal();

const fetchEnabled = ref(false);
const { result, refetch } = useQuery(GetDirectoriesDocument, undefined, () => ({
  enabled: fetchEnabled.value,
}));

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

watch(
  () => uploadModalState.value.state,
  () => {
    if (uploadModalState.value.state === "show") getData();
  },
  { immediate: true }
);
</script>
