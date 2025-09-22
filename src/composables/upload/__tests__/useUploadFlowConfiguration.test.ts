import { describe, it, expect } from "vitest";
import { useUploadFlowConfiguration } from "@/composables/upload/useUploadFlowConfiguration";
import { UploadFlow } from "@/__mocks__/queries";

describe("useUploadFlowConfiguration", () => {
  it("Should contain configurations for all upload-flows", () => {
    const { getUploadFlowConfiguration } = useUploadFlowConfiguration();
    const flowKeys = Object.values(UploadFlow);

    flowKeys.forEach((flowKey: string) => {
      const flowConfiguration = getUploadFlowConfiguration(
        flowKey as UploadFlow,
      );
      expect(flowConfiguration).toBeTruthy();
    });
  });
});
