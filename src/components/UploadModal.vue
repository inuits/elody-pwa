<template>
  <BaseModal
    :modal-state="getModalInfo(TypeModals.Upload).state"
    :modal-position="getModalInfo(TypeModals.Upload).modalPosition"
    modal-width-style="w-5/12"
    @hide-modal="closeModal(TypeModals.Upload)"
  >
    <div class="w-full h-full flex flex-col">
      <div class="flex-grow flex-shrink-0">
        <BaseTabs
          v-if="
            getModalInfo(TypeModals.Upload).modalTabToOpen ===
              ModalChoices.Import && dropzoneEntityToCreateQueryResult
          "
        >
          <BaseTab :title="$t('upload.upload-files')">
            <upload-modal-dropzone
              v-if="
                getModalInfo(TypeModals.Upload).modalTabToOpen ===
                ModalChoices.Import
              "
              :entity-to-create="
                dropzoneEntityToCreateQueryResult.DropzoneEntityToCreate
              "
            />
          </BaseTab>
          <BaseTab v-if="directoriesEnabled" :title="$t('upload.import')">
            <upload-modal-import
              v-if="
                getModalInfo(TypeModals.Upload).modalTabToOpen ===
                ModalChoices.Import
              "
              :directories="directoriesQueryResult.Directories"
            />
          </BaseTab>
        </BaseTabs>

        <BaseTabs
          v-if="
            getModalInfo(TypeModals.Upload).modalTabToOpen ===
              ModalChoices.Dropzone && dropzoneEntityToCreateQueryResult
          "
        >
          <BaseTab :title="$t('upload.upload-files')">
            <div class="h-full">
              <upload-modal-dropzone
                v-if="
                  getModalInfo(TypeModals.Upload).modalTabToOpen ===
                  ModalChoices.Dropzone
                "
                :entity-to-create="
                  dropzoneEntityToCreateQueryResult.DropzoneEntityToCreate
                "
              />
            </div>
          </BaseTab>
          <BaseTab title="Select file">
            <div class="h-full">
              <AssetLibrary
                :enable-selection="true"
                @add-selection="addSelection"
              />
            </div>
          </BaseTab>
        </BaseTabs>
      </div>
    </div>
  </BaseModal>
</template>

<script lang="ts" setup>
import BaseModal from "@/components/base/BaseModal.vue";
import BaseTab from "./BaseTab.vue";
import BaseTabs from "./BaseTabs.vue";
import AssetLibrary from "./library/AssetLibrary.vue";
import UploadModalDropzone from "./UploadModalDropzone.vue";
import UploadModalImport from "./UploadModalImport.vue";
import useMediaAssetLinkHelper from "../composables/useMediaAssetLinkHelper";
import useMetaDataHelper from "../composables/useMetaDataHelper";
import { ref, watch, inject } from "vue";
import { useQuery } from "@vue/apollo-composable";
import {
  GetDirectoriesDocument,
  GetDropzoneEntityToCreateDocument,
  TypeModals,
  ModalChoices,
  ModalState,
} from "../generated-types/queries";
import { useBaseModal } from "@/composables/useBaseModal";

const { addMediaFileToLinkList } = useMediaAssetLinkHelper();
const { mediafiles } = useMetaDataHelper();
const { getModalInfo, closeModal } = useBaseModal();
const fetchEnabled = ref(false);
const config = inject("config") as any;
const directoriesEnabled = config.features.hasDirectoryImport;

const { result: directoriesQueryResult, refetch: refetchDirectoriesQuery } =
  useQuery(GetDirectoriesDocument, undefined, () => ({
    enabled: directoriesEnabled === false ? false : fetchEnabled.value,
  }));
const {
  result: dropzoneEntityToCreateQueryResult,
  refetch: refetchDropzoneEntityToCreateQuery,
} = useQuery(GetDropzoneEntityToCreateDocument, undefined, () => ({
  enabled: fetchEnabled.value,
}));

const getData = () => {
  if (getModalInfo(TypeModals.Upload).modalTabToOpen === ModalChoices.Import) {
    if (fetchEnabled.value === true) {
      refetchDirectoriesQuery();
      refetchDropzoneEntityToCreateQuery();
    } else fetchEnabled.value = true;
  }
};

const addSelection = (entity: any) => {
  const mediafile = JSON.parse(JSON.stringify(entity.media.mediafiles[0]));
  mediafiles.value.push(mediafile);
  addMediaFileToLinkList(mediafile);
};

watch(
  () => getModalInfo(TypeModals.Upload).state,
  (uploadModalState: ModalState) => {
    if (uploadModalState === ModalState.Show) getData();
  },
  { immediate: true }
);
</script>
