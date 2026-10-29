import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import UploadFilePreviewProgress from "../UploadFilePreviewProgress.vue";

const bar = (props: { isValidationFile: boolean; hidePrepareStep?: boolean }) =>
  shallowMount(UploadFilePreviewProgress, { props }).find('[role="progressbar"]');

describe("UploadFilePreviewProgress", () => {
  it("is a progressbar starting at zero", () => {
    const progress = bar({ isValidationFile: false });
    expect(progress.attributes("aria-valuemin")).toBe("0");
    expect(progress.attributes("aria-valuenow")).toBe("0");
  });

  it("has one step per visible stage", () => {
    expect(bar({ isValidationFile: false }).attributes("aria-valuemax")).toBe("3");
    expect(
      bar({ isValidationFile: false, hidePrepareStep: true }).attributes(
        "aria-valuemax",
      ),
    ).toBe("1");
    expect(bar({ isValidationFile: true }).attributes("aria-valuemax")).toBe("1");
  });
});
