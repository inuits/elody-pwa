import { shallowMount } from "@vue/test-utils";
import BaseContextMenuActions from "../BaseContextMenuActions.vue";
import { describe, it, expect, vi, afterEach } from "vitest";
import type { Entitytyping } from "@/generated-types/queries";
import { type ContextMenuActions } from "@/generated-types/queries";
import { flushPromises } from "@vue/test-utils";

vi.mock("@/types", () => ({
  Unicons: {
    EllipsisVThinline: { name: "EllipsisV" },
  },
}));

vi.mock("@/main", () => {
  const actualModule = vi.importActual("@/main");

  return {
    ...actualModule,
    apolloClient: {
      ...actualModule.apolloClient,
      query: vi.fn().mockResolvedValue({
        data: {},
      }),
    },
  };
});

const mocks = vi.hoisted(() => {
  return {
    advancedPermissions: {
      can_delete: false,
      no_way: false,
    },
  };
});

vi.mock("@/composables/usePermissions", () => ({
  usePermissions: () => ({
    can: vi.fn(),
    fetchAdvancedPermission: vi.fn(),
    fetchPermissionsOfContextMenu: vi.fn(),
    setExtraVariables: vi.fn(),
  }),
  ignorePermissions: { value: false },
  advancedPermissions: mocks.advancedPermissions,
}));

describe("BaseContextMenuActions", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  const contextMenuActions = {
    doLinkAction: {
      label: "contextMenu.contextMenuLinkAction.followLink",
      icon: "AngleRight",
    },
    doElodyAction: {
      label: "contextMenu.contextMenuElodyAction.delete-relation",
      action: "DeleteRelation",
      can: ["can_delete"],
      icon: "Trash",
    },
  } as ContextMenuActions;

  it("contains 1 option if permission is granted", async () => {
    mocks.advancedPermissions["can_delete"] = true;

    const wrapper = shallowMount(BaseContextMenuActions, {
      props: {
        contextMenuActions,
        formId: "24",
        entityId: "2f4d",
        entityType: "BaseType" as Entitytyping,
      },
    });

    await flushPromises();

    expect(Object.keys(wrapper.vm.availableContextMenuActions).length).toBe(2);
    expect(wrapper.vm.availableContextMenuActions).toStrictEqual(
      contextMenuActions,
    );
  });

  it("has only basic option if permission is not granted", async () => {
    mocks.advancedPermissions["can_delete"] = false;

    const wrapper = shallowMount(BaseContextMenuActions, {
      props: {
        contextMenuActions,
        formId: "24",
        entityId: "24",
        entityType: "BaseType" as Entitytyping,
      },
    });

    await flushPromises();

    expect(Object.keys(wrapper.vm.availableContextMenuActions).length).toBe(1);
    expect(wrapper.vm.availableContextMenuActions).toStrictEqual({
      doLinkAction: contextMenuActions.doLinkAction,
    });
  });

  it("contains 2 basic options if permissions are not provided", async () => {
    const basicContextMenuActions = {
      doLinkAction: {
        label: "contextMenu.contextMenuLinkAction.followLink",
        icon: "AngleRight",
      },
      doElodyAction: {
        label: "contextMenu.contextMenuElodyAction.delete-relation",
        action: "DeleteRelation",
        icon: "Trash",
      },
    } as ContextMenuActions;

    const wrapper = shallowMount(BaseContextMenuActions, {
      props: {
        contextMenuActions: basicContextMenuActions,
        formId: "24",
        entityId: "24",
        entityType: "BaseType" as Entitytyping,
      },
    });

    await flushPromises();

    expect(Object.keys(wrapper.vm.availableContextMenuActions).length).toBe(2);
    expect(wrapper.vm.availableContextMenuActions).toStrictEqual(
      basicContextMenuActions,
    );
  });

  it("contains the option to render if options were provided with delay", async () => {
    mocks.advancedPermissions["can_delete"] = true;

    const wrapper = shallowMount(BaseContextMenuActions, {
      props: {
        contextMenuActions: undefined,
        formId: "24",
        entityId: "24",
        entityType: "BaseType" as Entitytyping,
      },
    });

    await flushPromises();

    expect(wrapper.vm.availableContextMenuActions).toBeUndefined();

    await wrapper.setProps({
      contextMenuActions,
    });

    await flushPromises();

    expect(Object.keys(wrapper.vm.availableContextMenuActions).length).toBe(2);
    expect(Object.keys(wrapper.vm.availableContextMenuActions)).toStrictEqual(
      Object.keys(contextMenuActions),
    );
  });
});
