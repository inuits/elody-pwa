import { shallowMount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import HeaderContextMenuActions from "../HeaderContextMenuActions.vue";
import type { ContextMenuActionRouteConfig } from "@/types/contextMenuRouteConfig";

vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({ getForm: () => undefined }),
}));

const downloadAction: ContextMenuActionRouteConfig = {
  type: "query",
  label: "contextMenu.createDownload",
  icon: "DownloadAlt",
  query: "CreateProductionDownload",
  navigateToCreatedEntity: true,
};

const mountComponent = (actions: ContextMenuActionRouteConfig[]) =>
  shallowMount(HeaderContextMenuActions, {
    props: { actions, entityId: "P-1", entityType: "production" as any },
    global: {
      stubs: {
        ContextMenuActionsShell: {
          props: ["hasPromotedActions", "hasOverflowActions", "split"],
          template:
            '<div :data-split="String(split)"><div data-test="promoted"><slot name="promoted" /></div><div data-test="overflow"><slot name="overflow" /></div></div>',
        },
      },
    },
  });

describe("HeaderContextMenuActions", () => {
  it("promotes a query action with showAsButton to a header button", () => {
    const wrapper = mountComponent([{ ...downloadAction, showAsButton: true }]);
    const promoted = wrapper.find('[data-test="promoted"]');
    const queryAction = promoted.findComponent({ name: "QueryAction" });

    expect(queryAction.exists()).toBe(true);
    expect(queryAction.props("asButton")).toBe(true);
    expect(queryAction.props("navigateToCreatedEntity")).toBe(true);
    expect(
      wrapper.find('[data-test="overflow"]').findComponent({ name: "QueryAction" }).exists(),
    ).toBe(false);
  });

  it("keeps a query action without showAsButton in the context menu", () => {
    const wrapper = mountComponent([downloadAction]);

    expect(
      wrapper.find('[data-test="promoted"]').findComponent({ name: "QueryAction" }).exists(),
    ).toBe(false);
    expect(
      wrapper.find('[data-test="overflow"]').findComponent({ name: "QueryAction" }).exists(),
    ).toBe(true);
  });

  it("asks for a split button with one promoted action and overflow", () => {
    const wrapper = mountComponent([
      { ...downloadAction, showAsButton: true },
      downloadAction,
    ]);

    expect(wrapper.attributes("data-split")).toBe("true");
  });

  it("sorts destructive actions last in the menu", () => {
    const wrapper = mountComponent([
      { ...downloadAction, label: "delete", tone: "Danger" as any },
      downloadAction,
    ]);

    expect(
      wrapper
        .find('[data-test="overflow"]')
        .findAllComponents({ name: "QueryAction" })
        .map((action) => action.props("label")),
    ).toEqual(["contextMenu.createDownload", "delete"]);
  });

  it("keeps one primary and moves further promoted actions into the menu", () => {
    const wrapper = mountComponent([
      { ...downloadAction, label: "first", showAsButton: true },
      { ...downloadAction, label: "menu" },
      { ...downloadAction, label: "second", showAsButton: true },
    ]);
    const labels = (slot: string) =>
      wrapper
        .find(`[data-test="${slot}"]`)
        .findAllComponents({ name: "QueryAction" })
        .map((action) => action.props("label"));

    expect(labels("promoted")).toEqual(["first"]);
    expect(labels("overflow")).toEqual(["second", "menu"]);
  });
});
