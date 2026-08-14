import { shallowMount } from "@vue/test-utils";
import ContextMenuActionsShell from "../ContextMenuActionsShell.vue";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/types", () => ({
  Unicons: {
    EllipsisVThinline: { name: "EllipsisV" },
    AngleDown: { name: "AngleDown" },
  },
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key, te: () => true }),
}));

const mountShell = (props: Record<string, unknown>) =>
  shallowMount(ContextMenuActionsShell, {
    props: {
      hasPromotedActions: false,
      hasOverflowActions: false,
      ...props,
    },
    global: { stubs: { unicon: true, BaseContextMenu: true } },
  });

describe("ContextMenuActionsShell (split button)", () => {
  it("renders a labeled primary button and emits primary on click", async () => {
    const wrapper = mountShell({ primaryLabel: "Open record" });

    const primary = wrapper.find("[data-cy='split-button-primary']");
    expect(primary.exists()).toBe(true);
    expect(primary.text()).toBe("Open record");

    await primary.trigger("click");
    expect(wrapper.emitted("primary")).toHaveLength(1);
  });

  it("renders a caret trigger next to the primary when overflow actions exist", () => {
    const wrapper = mountShell({
      primaryLabel: "Open record",
      hasOverflowActions: true,
    });

    const caret = wrapper.find("[data-cy='split-button-caret']");
    expect(caret.exists()).toBe(true);
    expect(caret.attributes("aria-haspopup")).toBe("menu");
    expect(caret.attributes("aria-label")).toBe("context-menu.more-actions");
  });

  it("renders no caret when there are no overflow actions", () => {
    const wrapper = mountShell({ primaryLabel: "Open record" });
    expect(wrapper.find("[data-cy='split-button-caret']").exists()).toBe(false);
  });

  it("renders a labeled menu button when only menuLabel is given", () => {
    const wrapper = mountShell({
      menuLabel: "Acties",
      hasOverflowActions: true,
    });

    const caret = wrapper.find("[data-cy='split-button-caret']");
    expect(caret.exists()).toBe(true);
    expect(caret.text()).toContain("Acties");
    expect(wrapper.find("[data-cy='split-button-primary']").exists()).toBe(
      false,
    );
  });

  it("disables the primary button when primaryDisabled is set", () => {
    const wrapper = mountShell({
      primaryLabel: "Open record",
      primaryDisabled: true,
    });

    expect(
      wrapper.find("[data-cy='split-button-primary']").attributes("disabled"),
    ).toBeDefined();
  });

  it("shows a labelled Actions trigger when no labels are given — never a bare ⋮", () => {
    const wrapper = mountShell({ hasOverflowActions: true });

    expect(wrapper.find("[data-cy='split-button-primary']").exists()).toBe(
      false,
    );
    const caret = wrapper.find("[data-cy='split-button-caret']");
    expect(caret.exists()).toBe(true);
    expect(caret.text()).toContain("library.actions-column");
  });
});
