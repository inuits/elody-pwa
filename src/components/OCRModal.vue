<template>
  <BaseModal
    class="mt-[15%]"
    :modal-state="modal.modalState.value.state"
    modal-position="center"
    modal-width-style="w-5/12"
    modal-height-style="h-5/12"
    @hide-modal="modal.closeModal()"
  >
    <div class="flex flex-wrap flex-col content-center p-8 h-full">
      <div class="flex justify-center basis-full mb-6 h-[94%]">
        Start OCR Job
      </div>
      <template v-if="ocrFormQueryResult">
        <div
          v-for="(inputField, index) in ocrFormQueryResult?.inputFields"
          :key="index"
        >
          <div class="flex justify-center basis-full mb-1">
            {{ inputField?.fieldName }}
          </div>
          <div class="flex justify-center basis-full mb-4">
            <BaseDropdownNew
              v-model="selectedOptions[inputField?.fieldName!]"
              :options="getDropdownOptions(inputField?.options || [])"
              dropdown-style="default"
            />
          </div>
        </div>
      </template>
    </div>
    <div class="flex justify-center gap-8 mx-[25%]">
      <BaseButtonNew
        class="font-bold mb-5"
        :label="$t('confirmation.confirm')"
        button-style="accentNormal"
        button-size="small"
        @click="() => startOCR()"
      />
      <BaseButtonNew
        class="font-bold mb-5"
        :label="$t('confirmation.cancel')"
        button-style="redDefault"
        button-size="small"
        @click="() => modal.closeModal()"
      />
    </div>
  </BaseModal>
</template>

<script lang="ts" setup>
import {
  TypeModals,
  type DropdownOption,
  type OcrForm,
  GetOcrFormDocument,
} from "@/generated-types/queries";
import BaseModal from "@/components/base/BaseModal.vue";
import { DamsIcons } from "@/generated-types/queries";
import BaseButtonNew from "@/components/base/BaseButtonNew.vue";
import BaseDropdownNew from "@/components/base/BaseDropdownNew.vue";
import { watch } from "vue";
import { useAvailableModals } from "@/composables/useAvailableModals";
import useMetaDataHelper from "@/composables/useMetaDataHelper";
const { mediafiles } = useMetaDataHelper();
import { useQuery } from "@vue/apollo-composable";
import type { Maybe } from "graphql/jsutils/Maybe";

let selectedOptions: Record<string, DropdownOption | undefined> = {};

const { getModal } = useAvailableModals();
const modal = getModal(TypeModals.Ocr);
const { onResult, refetch } = useQuery<OcrForm>(GetOcrFormDocument);
let ocrFormQueryResult: OcrForm;

onResult((queryResult) => {
  if (!queryResult || !queryResult.data) return;

  // map queryResult to OCRForm
  ocrFormQueryResult = queryResult.data.OCRForm as OcrForm;
});
const getDropdownOptions = (
  options: Maybe<Maybe<string>[]> | undefined
): DropdownOption[] => {
  if (!options) return [];

  return options?.map(
    (opt) =>
      ({
        icon: DamsIcons.NoIcon,
        label: opt,
        value: opt,
      } as DropdownOption)
  );
};

const startOCR = async () => {
  // Get the selectedOptions and use default values if not found
  let selectedLanguage = selectedOptions["Language"]?.value || "nld";
  let selectedFileformat = selectedOptions["Fileformat"]?.value || "pdf";

  console.log(
    `OCRing ${mediafiles.value.length} mediafile(s) in ${selectedLanguage} and with the ${selectedFileformat} fileformat`
  );
  // Go through all the mediafiles (of the current entity) and start an OCR request with the filetype selected in the dropdown
  for (const mf of mediafiles.value) {
    const mediafileID = mf._id;
    const language = selectedLanguage;
    const operation = selectedFileformat;
    let newMediafileID = "";

    await fetch(`http://ocr-service.digipolis-dams.localhost:8100/ocr`, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "no-cors",
      },

      method: "POST",

      body: JSON.stringify({
        mediafile_id: [mediafileID],
        operation: operation,
        language: language,
      }),
    })
      .then((response: Response) => {
        if (!response.ok) throw response;

        return response.text();
      })
      // TODO: delete this, it's not necessary but it's useful during development to see the newly created mediafile
      .then((response) => {
        console.log(response);
        const regex = /mediafile id: \[(.*?)\]/i;
        const matches = response.match(regex);
        const mediafileID = matches ? matches[1] : "";
        console.log(mediafileID);
        newMediafileID = mediafileID;
      })
      .catch((error) => console.error("Error sending request", error));

    console.log("OCR is starting, new mediafile:", newMediafileID);

    // Wait a few seconds so the OCR job is finished
    await new Promise((resolve) => setTimeout(resolve, 6000));

    console.log("starting second fetch");
    // TODO: delete this fetch, it's not necessary but it's useful during development to see the newly created mediafile
    fetch(
      `http://collection-api.digipolis-dams.localhost:8100/mediafiles/${newMediafileID}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "GET",
      }
    )
      .then((response: Response) => {
        if (!response.ok) throw response;

        return response.json();
      })
      .then((response) => {
        console.log(response);
        console.log(response.filename);
      })
      .catch(async (err) => console.error(err));
  }

  // Close modal after OCRing
  modal.closeModal();
};

watch(
  () => getModal(TypeModals.Ocr).modalState.value.state,
  () => {
    refetch();
  }
);
</script>
