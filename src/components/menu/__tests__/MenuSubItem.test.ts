import { mount } from "@vue/test-utils";
import MenuSubItem from "../MenuSubItem.vue";
import { describe, it, expect, vi, afterEach } from "vitest";
import { Entitytyping, MenuItem } from "@/generated-types/queries";
import { flushPromises } from "@vue/test-utils";

vi.mock("vue-router", () => ({
  useRoute: () => ({
    path: "/",
  }),
}));

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({
    openModal: vi.fn(() => true),
  }),
}));

vi.mock("@/composables/useMenuHelper", () => ({
  default: () => ({
    checkIfRouteOrModal: vi.fn(),
  }),
  MenuItemType: {
    modal: "modal",
    link: "link",
  },
}));

vi.mock("@vue/apollo-composable", () => ({
  useQuery: vi.fn(() => ({
    onResult: vi.fn((callback) =>
      callback({
        data: {},
      })
    ),
    onError: vi.fn(),
  })),
}));

vi.mock("@/types", () => ({
  Unicons: {
    Plus: { name: "plus" },
  },
}));

const mocks = vi.hoisted(() => {
  return {
    fetchAdvancedPermissions: vi.fn(),
  };
});

vi.mock("@/composables/usePermissions", () => ({
  usePermissions: () => ({
    can: vi.fn(() => true),
    fetchAdvancedPermission: mocks.fetchAdvancedPermissions,
  }),
}));

describe("MenuSubItem", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  const subMenuItem: MenuItem = {
    label: "navigation.devices",
    entityType: "RealDevice" as Entitytyping,
    typeLink: {
      route: { destination: "realDevice" },
    },
    can: ["read-real-device"],
  };

  it("renders the component if permission is granted", async () => {
    mocks.fetchAdvancedPermissions.mockReturnValue(true);

    const wrapper = mount(MenuSubItem, {
      props: {
        show: true,
        subMenuItem,
      },
    });

    await flushPromises();
    const menuItem = await wrapper.find('[data-cy="menu-sub-item"]');
    expect(menuItem.exists()).toBe(true);
  });

  it("hides the component if permission is not granted", async () => {
    mocks.fetchAdvancedPermissions.mockReturnValue(false);

    const wrapper = mount(MenuSubItem, {
      props: {
        show: true,
        subMenuItem,
      },
    });

    await flushPromises();

    const menuItem = wrapper.find('[data-cy="menu-sub-item"]');
    expect(menuItem.exists()).toBe(false);
  });

  it("renders the component if no advanced permission provided and if 'show' is true", async () => {
    const wrapper = mount(MenuSubItem, {
      props: {
        show: true,
        subMenuItem: {
          label: "navigation.devices",
          entityType: "RealDevice" as Entitytyping,
          typeLink: {
            route: { destination: "realDevice" },
          },
        },
      },
    });

    await flushPromises();

    const menuItem = wrapper.find('[data-cy="menu-sub-item"]');
    expect(menuItem.exists()).toBe(true);
  });

  it("hides the component if no advanced permission provided and if 'show' is false", async () => {
    const wrapper = mount(MenuSubItem, {
      props: {
        show: false,
        subMenuItem: {
          label: "navigation.devices",
          entityType: "RealDevice" as Entitytyping,
          typeLink: {
            route: { destination: "realDevice" },
          },
        },
      },
    });

    await flushPromises();

    const menuItem = wrapper.find('[data-cy="menu-sub-item"]');
    expect(menuItem.exists()).toBe(false);
  });
});
