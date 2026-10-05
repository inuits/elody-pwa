import { shallowMount } from "@vue/test-utils";
import BaseContextMenuActions from "../BaseContextMenuActions.vue";
import { describe, it, expect, vi } from "vitest";
import type { Entitytyping } from "@/generated-types/queries";
import { type ContextMenuActions } from "@/generated-types/queries";
import { flushPromises } from "@vue/test-utils";
import { BulkOperationsContextEnum } from "@/composables/useBulkOperations";

vi.mock("@/types", () => ({
  Unicons: {
    EllipsisVThinline: { name: "EllipsisV" },
  },
}));

const followLink = {
  label: "contextMenu.contextMenuLinkAction.followLink",
  icon: "AngleRight",
};

const deleteRelation = {
  label: "contextMenu.contextMenuElodyAction.delete-relation",
  action: "DeleteRelation",
  icon: "Trash",
};

const getWrapper = (contextMenuActions: unknown) =>
  shallowMount(BaseContextMenuActions, {
    props: {
      contextMenuActions: contextMenuActions as ContextMenuActions,
      entityId: "2f4d",
      entityType: "BaseType" as Entitytyping,
      bulkOperationsContext: BulkOperationsContextEnum.Home,
    },
  });

describe("BaseContextMenuActions", () => {
  it("renders every action the graphql layer handed it", async () => {
    const actions = { doLinkAction: followLink, doElodyAction: deleteRelation };
    const wrapper = getWrapper(actions);
    await flushPromises();

    expect(wrapper.vm.hasAvailableContextMenuActions).toBeTruthy();
    expect(wrapper.vm.overflowActions).toStrictEqual(actions);
  });

  it("skips an action the graphql layer left out", async () => {
    const wrapper = getWrapper({
      doLinkAction: followLink,
      doElodyAction: null,
    });
    await flushPromises();

    expect(Object.keys(wrapper.vm.overflowActions!).length).toBe(1);
    expect(wrapper.vm.overflowActions).toStrictEqual({
      doLinkAction: followLink,
    });
  });

  it("skips an action the config hides", async () => {
    const wrapper = getWrapper({
      doLinkAction: followLink,
      doElodyAction: { ...deleteRelation, hidden: true },
    });
    await flushPromises();

    expect(wrapper.vm.overflowActions).toStrictEqual({
      doLinkAction: followLink,
    });
  });

  it("promotes the actions configured as a button", async () => {
    const promotedAction = { ...deleteRelation, showAsButton: true };
    const wrapper = getWrapper({
      doLinkAction: followLink,
      doElodyAction: promotedAction,
    });
    await flushPromises();

    expect(wrapper.vm.hasPromotedActions).toBeTruthy();
    expect(wrapper.vm.overflowActions).toStrictEqual({
      doLinkAction: followLink,
    });
    expect(wrapper.vm.promotedActions).toStrictEqual({
      doElodyAction: promotedAction,
    });
  });

  it("renders actions that only arrive after mount", async () => {
    const wrapper = getWrapper(undefined);
    await flushPromises();
    expect(wrapper.vm.hasAvailableContextMenuActions).toBeFalsy();

    const actions = { doLinkAction: followLink, doElodyAction: deleteRelation };
    await wrapper.setProps({ contextMenuActions: actions as ContextMenuActions });
    await flushPromises();

    expect(Object.keys(wrapper.vm.overflowActions!)).toStrictEqual(
      Object.keys(actions),
    );
  });
});
