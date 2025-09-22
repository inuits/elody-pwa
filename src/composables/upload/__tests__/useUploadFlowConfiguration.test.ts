import { describe, expect, it } from "vitest";
import { useUploadFlowConfiguration } from "@/composables/upload/useUploadFlowConfiguration";
import { UploadFlow } from "@/__mocks__/queries";
import useUpload from "@/composables/upload/useUpload";
import { createMockDropzoneFile } from "@/__tests__/helpers.test";

const { getUploadFlowConfiguration } = useUploadFlowConfiguration();
const { files } = useUpload({});

describe("useUploadFlowConfiguration", () => {
  it("Should contain configurations for all upload-flows", () => {
    const flowKeys = Object.values(UploadFlow);

    flowKeys.forEach((flowKey: string) => {
      const flowConfiguration = getUploadFlowConfiguration(
        flowKey as UploadFlow,
      );
      expect(flowConfiguration).toBeTruthy();
    });
  });

  describe("useCsvOnlyUpload", () => {
    const csvOnlyUploadConfiguration = getUploadFlowConfiguration(
      UploadFlow.CsvOnly,
    );

    files.value = [createMockDropzoneFile("test.csv", "text/csv")];

    it("Should check if a csv is present", () => {
      expect(csvOnlyUploadConfiguration?.validateFiles()).toBeTruthy();
    });
  });
});
