import { shallowMount } from "@vue/test-utils";
import BaseContextMenuActions from "../BaseContextMenuActions.vue";
import { describe, it, expect, vi, afterEach } from "vitest";
import type { Entitytyping } from "@/generated-types/queries";
import { type ContextMenuActions } from "@/generated-types/queries";
import { flushPromises } from "@vue/test-utils";
import { BulkOperationsContextEnum } from "@/composables/useBulkOperations";

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
    advancedPermissions: {} as Record<string, boolean>,
  };
});

vi.mock("@/composables/usePermissions", () => ({
  usePermissions: () => ({
    can: vi.fn(),
    fetchAdvancedPermission: vi.fn(),
    fetchPermissionsOfContextMenu: vi.fn(),
    setExtraVariables: vi.fn(),
    createPermissionCacheKey: vi.fn((options) => {
      let key = options.permission;
      if (options.parentEntityId) {
        key += `|parent:${options.parentEntityId}`;
      }
      if (options.childEntityId) {
        key += `|child:${options.childEntityId}`;
      }
      return key;
    }),
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
    mocks.advancedPermissions["can_delete|child:2f4d"] = true;

    const wrapper = shallowMount(BaseContextMenuActions, {
      props: {
        contextMenuActions,
        entityId: "2f4d",
        entityType: "BaseType" as Entitytyping,
        bulkOperationsContext: BulkOperationsContextEnum.Home,
      },
    });

    await flushPromises();

    expect(wrapper.vm.availableContextMenuActions).toBeDefined();
    expect(Object.keys(wrapper.vm.availableContextMenuActions!).length).toBe(2);
    expect(wrapper.vm.availableContextMenuActions).toStrictEqual(
      contextMenuActions,
    );
  });

  it("has only basic option if permission is not granted", async () => {
    mocks.advancedPermissions["can_delete|child:24"] = false;

    const wrapper = shallowMount(BaseContextMenuActions, {
      props: {
        contextMenuActions,
        entityId: "24",
        entityType: "BaseType" as Entitytyping,
        bulkOperationsContext: BulkOperationsContextEnum.Home,
      },
    });

    await flushPromises();

    expect(wrapper.vm.availableContextMenuActions).toBeDefined();
    expect(Object.keys(wrapper.vm.availableContextMenuActions!).length).toBe(1);
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
        entityId: "24",
        entityType: "BaseType" as Entitytyping,
        bulkOperationsContext: BulkOperationsContextEnum.Home,
      },
    });

    await flushPromises();

    expect(wrapper.vm.availableContextMenuActions).toBeDefined();
    expect(Object.keys(wrapper.vm.availableContextMenuActions!).length).toBe(2);
    expect(wrapper.vm.availableContextMenuActions).toStrictEqual(
      basicContextMenuActions,
    );
  });

  it("contains the option to render if options were provided with delay", async () => {
    mocks.advancedPermissions["can_delete|child:24"] = true;

    const wrapper = shallowMount(BaseContextMenuActions, {
      props: {
        contextMenuActions: undefined,
        entityId: "24",
        entityType: "BaseType" as Entitytyping,
        bulkOperationsContext: BulkOperationsContextEnum.Home,
      },
    });

    await flushPromises();

    expect(wrapper.vm.availableContextMenuActions).toBeUndefined();

    await wrapper.setProps({
      contextMenuActions,
    });

    await flushPromises();

    expect(wrapper.vm.availableContextMenuActions).toBeDefined();
    expect(Object.keys(wrapper.vm.availableContextMenuActions!).length).toBe(2);
    expect(Object.keys(wrapper.vm.availableContextMenuActions!)).toStrictEqual(
      Object.keys(contextMenuActions),
    );
  });
});
