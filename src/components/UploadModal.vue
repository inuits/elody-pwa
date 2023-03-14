<template>
  <BaseModal
    :large="true"
    :scroll="false"
    :modal-state="uploadModalState.state"
    @hide-modal="closeUploadModal"
  >
    <div class="w-full h-full flex flex-col overflow-auto">
      <BaseTabs
        v-if="
          modalToOpen === modalChoices.IMPORT &&
          directoriesQueryResult &&
          dropzoneEntityToCreateQueryResult
        "
      >
        <BaseTab :title="$t('upload.upload-files')">
          <upload-modal-dropzone
            v-if="modalToOpen === modalChoices.IMPORT"
            :entity-to-create="
              dropzoneEntityToCreateQueryResult.DropzoneEntityToCreate
            "
          />
        </BaseTab>
        <BaseTab :title="$t('upload.import')">
          <upload-modal-import
            v-if="modalToOpen === modalChoices.IMPORT"
            :directories="directoriesQueryResult.Directories"
          />
        </BaseTab>
      </BaseTabs>

      <BaseTabs
        v-if="
          modalToOpen === modalChoices.DROPZONE &&
          dropzoneEntityToCreateQueryResult
        "
      >
        <BaseTab :title="$t('upload.upload-files')">
          <div class="h-full">
            <upload-modal-dropzone
              v-if="modalToOpen === modalChoices.DROPZONE"
              :entity-to-create="
                dropzoneEntityToCreateQueryResult.DropzoneEntityToCreate
              "
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
import BaseTab from "@/components/BaseTab.vue";
import BaseTabs from "@/components/BaseTabs.vue";
import MediaFileLibrary from "@/components/MediaFileLibrary.vue";
import UploadModalDropzone from "@/components/UploadModalDropzone.vue";
import UploadModalImport from "@/components/UploadModalImport.vue";
import useMediaAssetLinkHelper from "@/composables/useMediaAssetLinkHelper";
import useMetaDataHelper from "../composables/useMetaDataHelper";
import useUploadModal, {
  modalChoices,
  uploadModalState,
} from "@/composables/useUploadModal";
import { ref, watch } from "vue";
import { useQuery } from "@vue/apollo-composable";
import {
  GetDirectoriesDocument,
  GetDropzoneEntityToCreateDocument,
} from "../generated-types/queries";

const { isMediaFileInLinkList } = useMediaAssetLinkHelper();
const { mediafiles } = useMetaDataHelper();
const { modalToOpen, closeUploadModal } = useUploadModal();

const fetchEnabled = ref(false);
const { result: directoriesQueryResult, refetch: refetchDirectoriesQuery } =
  useQuery(GetDirectoriesDocument, undefined, () => ({
    enabled: fetchEnabled.value,
  }));
const {
  result: dropzoneEntityToCreateQueryResult,
  refetch: refetchDropzoneEntityToCreateQuery,
} = useQuery(GetDropzoneEntityToCreateDocument, undefined, () => ({
  enabled: fetchEnabled.value,
}));

const getData = () => {
  if (modalToOpen.value === modalChoices.IMPORT) {
    if (fetchEnabled.value === true) {
      refetchDirectoriesQuery();
      refetchDropzoneEntityToCreateQuery();
    } else fetchEnabled.value = true;
  }
};

const addSelection = (entity: any) => {
  const mediafile = JSON.parse(JSON.stringify(entity.media.mediafiles[0]));
  mediafiles.value.push(mediafile);
  isMediaFileInLinkList(mediafile);
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
