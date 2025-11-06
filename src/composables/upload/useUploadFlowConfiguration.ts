import { ref } from "vue";
import { UploadFlow } from "@/generated-types/queries";
import { useOcrUpload } from "@/composables/upload/useOcrUpload";
import { useCsvOnlyUpload } from "@/composables/upload/useCsvOnlyUpload";
import { useXmlMarcUpload } from "@/composables/upload/useXmlMarcUpload";
import { useMediafilesWithOptionalCsvUpload } from "@/composables/upload/useMediafilesWithOptionalCsvUpload";
import { useMediafilesWithRequiredCsvUpload } from "@/composables/upload/useMediafilesWithRequiredCsvUpload";
import { useOptionalMediafileUpload } from "@/composables/upload/useOptionalMediafilesUpload";
import { useMediafilesOnlyUpload } from "@/composables/upload/useMediafilesOnlyUpload";
import { useUpdateMetadataUpload } from "@/composables/upload/useUpdateMetadataUpload";
import { useCsvReorderingUpload } from "@/composables/upload/useCsvReorderingUpload";
import { useSharedUploadLogic } from "@/composables/upload/useSharedUploadLogic";
import type { DropzoneFile } from "dropzone";
import type { EntityInput } from "@/generated-types/queries";

export type UploadContext = {
  entityId?: string;
  file: DropzoneFile;
  entityInput?: EntityInput | undefined;
};

export type UploadFlowConfiguration = {
  validateFiles: () => boolean;
  getUploadUrl?: (ctx: UploadContext) => Promise<string>;
  checkUploadValidity: () => boolean;
};

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
  const uploadFlowConfigurations = ref<{
    [key: string]: UploadFlowConfiguration;
  }>({
    [UploadFlow.CsvOnly]: {
      validateFiles: useCsvOnlyUpload().checkFileValidity,
      checkUploadValidity: useCsvOnlyUpload().checkUploadValidity,
    },
    [UploadFlow.XmlMarc]: {
      validateFiles: useXmlMarcUpload().checkFileValidity,
      getUploadUrl: async ({}) => "url",
      checkUploadValidity: useXmlMarcUpload().checkUploadValidity,
    },
    [UploadFlow.MediafilesWithOptionalCsv]: {
      validateFiles: useMediafilesWithOptionalCsvUpload().checkFileValidity,
      getUploadUrl: async ({ file }) =>
        useSharedUploadLogic().getUploadUrl(file),
      checkUploadValidity:
        useMediafilesWithOptionalCsvUpload().checkFileValidity,
    },
    [UploadFlow.MediafilesWithRequiredCsv]: {
      validateFiles: useMediafilesWithRequiredCsvUpload().checkFileValidity,
      getUploadUrl: async ({ file }) =>
        useSharedUploadLogic().getUploadUrl(file),
      checkUploadValidity:
        useMediafilesWithRequiredCsvUpload().checkUploadValidity,
    },
    [UploadFlow.OptionalMediafiles]: {
      validateFiles: useOptionalMediafileUpload().checkFileValidity,
      getUploadUrl: async ({ entityId, file, entityInput }) =>
        useSharedUploadLogic().getUploadUrlForMediafileOnEntity(
          entityId!,
          file,
          entityInput,
        ),
      checkUploadValidity: useOptionalMediafileUpload().checkUploadValidity,
    },
    [UploadFlow.MediafilesOnly]: {
      validateFiles: useMediafilesOnlyUpload().checkFileValidity,
      getUploadUrl: async ({ entityId, file, entityInput }) =>
        useSharedUploadLogic().getUploadUrlForMediafileOnEntity(
          entityId!,
          file,
          entityInput,
        ),
      checkUploadValidity: useMediafilesOnlyUpload().checkUploadValidity,
    },
    [UploadFlow.MediafilesWithOcr]: {
      validateFiles: useOcrUpload().checkFileValidity,
      getUploadUrl: async ({ file }) =>
        useSharedUploadLogic().getUploadUrl(file),
      checkUploadValidity: useOcrUpload().checkUploadValidity,
    },
    [UploadFlow.UpdateMetadata]: {
      validateFiles: useUpdateMetadataUpload().checkFileValidity,
      checkUploadValidity: useUpdateMetadataUpload().checkUploadValidity,
    },
    [UploadFlow.UploadCsvForReordening]: {
      validateFiles: useCsvReorderingUpload().checkFileValidity,
      checkUploadValidity: useCsvReorderingUpload().checkUploadValidity,
    },
  });

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
