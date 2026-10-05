import { shallowMount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import BaseContextMenuItem from "../BaseContextMenuItem.vue";

vi.mock("@/types", () => ({
  Unicons: {
    DownloadAlt: { name: "download-alt" },
    QuestionCircle: { name: "question-circle" },
  },
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

describe("BaseContextMenuItem", () => {
  it("passes the icon to the button when rendered as a button", () => {
    const wrapper = shallowMount(BaseContextMenuItem, {
      props: { label: "Download", icon: "download-alt", asButton: true },
    });

    expect(
      wrapper.findComponent({ name: "BaseButtonNew" }).props("icon"),
    ).toBe("DownloadAlt");
  });
});
