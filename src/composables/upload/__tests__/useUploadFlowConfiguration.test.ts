import { describe, expect, it } from "vitest";
import { useUploadFlowConfiguration } from "@/composables/upload/useUploadFlowConfiguration";
import { UploadFlow } from "@/__mocks__/queries";
import useUpload from "@/composables/upload/useUpload";
import type { DropzoneFile } from "dropzone";

const { getUploadFlowConfiguration } = useUploadFlowConfiguration();
const { files } = useUpload({});

const createMockDropzoneFile = (
  name = "test.csv",
  type = "text/csv",
  contents = "id,name\n1,test",
): DropzoneFile => {
  const file = new File([contents], name, { type });

  const dropzoneFile = file as unknown as DropzoneFile;
  (dropzoneFile as any).upload = { progress: 0, bytesSent: 0 };
  (dropzoneFile as any).status = "added";

  return dropzoneFile;
};

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
