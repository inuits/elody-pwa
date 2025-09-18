import { ref } from "vue";
import { UploadFlow } from "@/generated-types/queries";
import { useOcrUpload } from "@/composables/upload/useOcrUpload";
import { useCsvOnlyUpload } from "@/composables/upload/useCsvOnlyUpload";
import { useXmlMarcUpload } from "@/composables/upload/useXmlMarcUpload";
import { useMediafilesWithOptionalCsvUpload } from "@/composables/upload/useMediafilesWithOptionalCsvUpload";
import { useMediafilesWithRequiredCsvUpload } from "@/composables/upload/useMediafilesWithRequiredCsvUpload";
import { useOptionalMediafileUpload } from "@/composables/upload/useOptionalMediafilesUpload";

export type UploadFlowConfiguration = {
  validateFiles: () => Boolean;
};

const uploadFlowConfigurations = ref<{
  [key: string]: UploadFlowConfiguration;
}>({
  [UploadFlow.CsvOnly]: {
    validateFiles: useCsvOnlyUpload().checkFileValidity,
  },
  [UploadFlow.XmlMarc]: {
    validateFiles: useXmlMarcUpload().checkFileValidity,
  },
  [UploadFlow.MediafilesWithOptionalCsv]: {
    validateFiles: useMediafilesWithOptionalCsvUpload().checkFileValidity,
  },
  [UploadFlow.MediafilesWithRequiredCsv]: {
    validateFiles: useMediafilesWithRequiredCsvUpload().checkFileValidity,
  },
  [UploadFlow.OptionalMediafiles]: {
    validateFiles: useOptionalMediafileUpload().checkFileValidity,
  },
  [UploadFlow.MediafilesOnly]: {
    validateFiles: useMediafilesWithRequiredCsvUpload().checkFileValidity,
  },
  [UploadFlow.MediafilesWithOcr]: {
    validateFiles: useOcrUpload().checkFileValidity,
  },
});

export const useUploadFlowConfiguration = (): {
  getUploadFlowConfiguration: (
    uploadFlow: UploadFlow,
  ) => UploadFlowConfiguration | undefined;
  addUploadFlowConfiguration: (
    uploadFlow: UploadFlow,
    configuration: UploadFlowConfiguration,
  ) => {
    [key: string]: UploadFlowConfiguration;
  };
} => {
  const getUploadFlowConfiguration = (
    uploadFlow: UploadFlow,
  ): UploadFlowConfiguration | undefined => {
    if (!uploadFlowConfigurations.value[uploadFlow]) {
      console.error(`UploadFlowConfiguration for ${uploadFlow} not found`);
      return undefined;
    }
    return uploadFlowConfigurations.value[uploadFlow];
  };

  const addUploadFlowConfiguration = (
    uploadFlow: UploadFlow,
    configuration: UploadFlowConfiguration,
  ): {
    [key: string]: UploadFlowConfiguration;
  } => {
    uploadFlowConfigurations.value[uploadFlow] = configuration;
    return uploadFlowConfigurations.value;
  };

  return {
    getUploadFlowConfiguration,
    addUploadFlowConfiguration,
  };
};
