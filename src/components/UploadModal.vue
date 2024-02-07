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
            ModalChoices.Import
          "
          class="h-full"
        >
          <BaseTab :title="t('upload.upload-files')">
            <upload-interface-dropzone
              v-if="
                getModalInfo(TypeModals.Upload).modalTabToOpen ===
                ModalChoices.Import
              "
            />
          </BaseTab>
          <!--<BaseTab v-if="directoriesEnabled" :title="t('upload.import')">
            <upload-modal-import
              v-if="
                getModalInfo(TypeModals.Upload).modalTabToOpen ===
                ModalChoices.Import
              "
              :directories="directoriesQueryResult.Directories"
            />
          </BaseTab>-->
        </BaseTabs>

        <!--<BaseTabs
          v-if="
            getModalInfo(TypeModals.Upload).modalTabToOpen ===
              ModalChoices.Dropzone && dropzoneEntityToCreateQueryResult
          "
        >
          <BaseTab :title="t('upload.upload-files')">
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
        </BaseTabs>-->
      </div>
    </div>
  </BaseModal>
</template>

<script lang="ts" setup>
import {
  GetDropzoneEntityToCreateDocument,
  TypeModals,
  ModalChoices,
  ModalState,
} from "@/generated-types/queries";
import BaseModal from "@/components/base/BaseModal.vue";
import BaseTab from "@/components/BaseTab.vue";
import BaseTabs from "@/components/BaseTabs.vue";
import UploadInterfaceDropzone from "@/components/UploadInterfaceDropzone.vue";
import { ref, watch } from "vue";
import { useBaseModal } from "@/composables/useBaseModal";
import { useI18n } from "vue-i18n";
import { useQuery } from "@vue/apollo-composable";

//const config = inject("config") as any;
//const directoriesEnabled = config.features.hasDirectoryImport;
const fetchEnabled = ref(false);
const { getModalInfo, closeModal } = useBaseModal();
const { t } = useI18n();

/*const { result: directoriesQueryResult, refetch: refetchDirectoriesQuery } =
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
      //refetchDirectoriesQuery();
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
);*/
</script>
