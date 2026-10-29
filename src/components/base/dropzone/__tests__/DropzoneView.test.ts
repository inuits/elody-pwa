import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DropzoneView from "../DropzoneView.vue";

const getWrapper = (fileCount = 0) =>
  mount(DropzoneView, {
    props: {
      modelValue: undefined,
      dropzoneLabel: "upload-fields.dropzone",
      isValidation: false,
      fileCount,
      style: "",
    },
    global: { mocks: { $t: (key: string) => key } },
  });

describe("DropzoneView", () => {
  it("opens the file dialog from a real button inside the dropzone message", () => {
    const button = getWrapper().find(".dz-message button");
    expect(button.exists()).toBe(true);
    expect(button.attributes("type")).toBe("button");
    expect(button.text()).toBe("upload-fields.dropzone");
  });

  it("keeps the button reachable once files are listed", () => {
    const button = getWrapper(2).find(".dz-message button");
    expect(button.exists()).toBe(true);
    expect(button.isVisible()).toBe(true);
  });
});
