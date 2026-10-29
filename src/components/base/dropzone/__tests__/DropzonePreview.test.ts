import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import DropzonePreview from "../DropzonePreview.vue";

const getWrapper = () =>
  shallowMount(DropzonePreview, {
    props: { modelValue: undefined, isValidationFile: false },
    global: { mocks: { $t: (key: string) => key }, stubs: { unicon: true } },
  });

describe("DropzonePreview row template", () => {
  it("removes a file with a real, named button", () => {
    const remove = getWrapper().find("[data-dz-remove]");
    expect(remove.element.tagName).toBe("BUTTON");
    expect(remove.attributes("type")).toBe("button");
    expect(remove.attributes("aria-label")).toBe("upload-fields.remove-file");
  });

  it("shows the file size next to the name", () => {
    expect(getWrapper().find("[data-dz-size]").exists()).toBe(true);
  });

  it("announces a row's errors", () => {
    expect(
      getWrapper().find(".error-message-container").attributes("role"),
    ).toBe("alert");
  });
});
