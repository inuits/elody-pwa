import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import ContextMenuActionsShell from "../ContextMenuActionsShell.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string>) =>
      params ? `${key}:${Object.values(params).join(",")}` : key,
  }),
}));

vi.mock("@/types", () => ({
  Unicons: {
    AngleDown: { name: "angle-down" },
    AngleUp: { name: "angle-up" },
    QuestionCircle: { name: "question-circle" },
  },
}));

const getWrapper = (props: Record<string, unknown> = {}) =>
  mount(ContextMenuActionsShell, {
    props: { hasPromotedActions: false, hasOverflowActions: true, ...props },
    attachTo: document.body,
    global: { stubs: { unicon: true, BaseContextMenu: true } },
  });

describe("ContextMenuActionsShell", () => {
  it("labels the overflow trigger instead of showing a bare glyph", () => {
    const trigger = getWrapper().find("button");

    expect(trigger.text()).toContain("contextMenu.actions");
    expect(trigger.attributes("aria-haspopup")).toBe("menu");
  });

  it("names the trigger after its scope when a label is given", () => {
    const trigger = getWrapper({ contextLabel: "Brief aan Jan" }).find(
      "button",
    );

    expect(trigger.attributes("aria-label")).toBe(
      "contextMenu.actions-for:Brief aan Jan",
    );
  });

  it("toggles aria-expanded when the trigger opens and closes the menu", async () => {
    const trigger = getWrapper().find("button");
    expect(trigger.attributes("aria-expanded")).toBe("false");

    await trigger.trigger("click");
    expect(trigger.attributes("aria-expanded")).toBe("true");

    await trigger.trigger("click");
    expect(trigger.attributes("aria-expanded")).toBe("false");
  });

  it("opens the menu with the down arrow", async () => {
    const trigger = getWrapper().find("button");

    await trigger.trigger("keydown", { key: "ArrowDown" });

    expect(trigger.attributes("aria-expanded")).toBe("true");
  });

  it("renders no trigger without overflow actions", () => {
    expect(getWrapper({ hasOverflowActions: false }).find("button").exists())
      .toBe(false);
  });
});
