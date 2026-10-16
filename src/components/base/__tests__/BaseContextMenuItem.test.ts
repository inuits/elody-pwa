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

  it("activates a menu item with Enter and Space", async () => {
    const wrapper = shallowMount(BaseContextMenuItem, {
      props: { label: "Dupliceer" },
    });
    const item = wrapper.find('[role="menuitem"]');

    await item.trigger("keydown", { key: "Enter" });
    await item.trigger("keydown", { key: " " });

    expect(wrapper.emitted("clicked")).toHaveLength(2);
  });

  it("keeps a disabled item focusable and marks it aria-disabled", async () => {
    const wrapper = shallowMount(BaseContextMenuItem, {
      props: { label: "Dupliceer", disable: true },
    });
    const item = wrapper.find('[role="menuitem"]');

    await item.trigger("keydown", { key: "Enter" });

    expect(item.attributes("aria-disabled")).toBe("true");
    expect(wrapper.emitted("clicked")).toBeUndefined();
  });

  it("does not repeat its icon and label inside a promoted button", () => {
    const wrapper = shallowMount(BaseContextMenuItem, {
      props: { label: "Download", icon: "download-alt", asButton: true },
      global: { renderStubDefaultSlot: true },
    });

    expect(wrapper.findComponent({ name: "BaseIcon" }).exists()).toBe(false);
  });

  it("styles a menu item with the menu tokens", () => {
    const wrapper = shallowMount(BaseContextMenuItem, {
      props: { label: "Dupliceer", icon: "download-alt" },
    });

    expect(wrapper.find('[role="menuitem"]').classes()).toEqual(
      expect.arrayContaining([
        "p-(--menu-item-padding)",
        "rounded-button",
        "hover:bg-accent-wash",
      ]),
    );
    expect(wrapper.findComponent({ name: "BaseIcon" }).classes()).toContain(
      "size-(--menu-icon-size)",
    );
  });

  it("shows a disabled item in disabled ink without the hover wash", () => {
    const classes = shallowMount(BaseContextMenuItem, {
      props: { label: "Dupliceer", disable: true },
    })
      .find('[role="menuitem"]')
      .classes();

    expect(classes).toContain("text-text-disabled");
    expect(classes).not.toContain("opacity-40");
    expect(classes).not.toContain("hover:bg-accent-wash");
  });
});
