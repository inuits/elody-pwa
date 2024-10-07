import { mount } from "@vue/test-utils";
import MenuItemComponent from "../MenuItem.vue";
import { describe, it, expect, vi, afterEach } from "vitest";
import { Entitytyping, MenuItem, DamsIcons } from "@/generated-types/queries";
import { flushPromises } from "@vue/test-utils";
import { ref } from "vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

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

vi.mock("@/composables/useMenuHelper", () => ({
  default: () => ({
    checkIfRouteOrModal: vi.fn(() => ({
      menuItemType: "link",
      action: "/some-path",
    })),
    setSelectedMenuItem: vi.fn(),
    selectedMenuItem: ref({ label: "Test Menu Item" }),
  }),
  MenuItemType: {
    modal: "modal",
    link: "link",
  },
}));

vi.mock("session-vue-3-oidc-library", () => ({
  useAuth: () => ({
    isAuthenticated: { value: true },
  }),
}));

const mocks = vi.hoisted(() => {
  return {
    fetchAdvancedPermissions: vi.fn(),
    can: vi.fn(),
  };
});

vi.mock("@/composables/usePermissions", () => ({
  usePermissions: () => ({
    can: mocks.fetchAdvancedPermissions,
    fetchAdvancedPermission: mocks.fetchAdvancedPermissions,
  }),
  ignorePermissions: { value: false },
}));

describe("MenuItem", () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  const menuItemProps: MenuItem = {
    label: "Test Menu Item",
    typeLink: {
      route: {
        destination: "some-path",
      },
    },
    can: ["test-permission"],
    subMenu: null,
    isLoggedIn: true,
  };

  it("renders the component if permission is granted", async () => {
    mocks.fetchAdvancedPermissions.mockReturnValue(true);

    const wrapper = mount(MenuItemComponent, {
      props: {
        menuitem: menuItemProps,
        icon: "Test" as DamsIcons,
        isExpanded: false,
        isBeingHovered: false,
      },
    });

    await flushPromises();

    const menuItem = await wrapper.find('[data-test="menu-item-component"]');
    expect(menuItem.exists()).toBe(true);
  });

  it("hides the component if permission is not granted", async () => {
    mocks.fetchAdvancedPermissions.mockReturnValue(false);

    const wrapper = mount(MenuItemComponent, {
      props: {
        menuitem: menuItemProps,
        icon: "Test" as DamsIcons,
        isExpanded: false,
        isBeingHovered: false,
      },
    });

    await flushPromises();

    const menuItem = await wrapper.find('[data-test="menu-item-component"]');
    expect(menuItem.exists()).toBe(false);
  });

  it("renders the component if permission is not provided", async () => {
    mocks.fetchAdvancedPermissions.mockReturnValue(true);
    mocks.can.mockReturnValue(true);

    const wrapper = mount(MenuItemComponent, {
      props: {
        menuitem: {
          label: "Test Menu Item",
          typeLink: {
            route: {
              destination: "some-path",
            },
          },
          entityType: "entityType" as Entitytyping,
          subMenu: null,
          isLoggedIn: true,
        },
        icon: "Test" as DamsIcons,
        isExpanded: false,
        isBeingHovered: false,
      },
    });

    await flushPromises();

    const menuItem = await wrapper.find('[data-test="menu-item-component"]');
    expect(menuItem.exists()).toBe(true);
  });

  it("hides the component if permission is not provided and no permissions for the entity type", async () => {
    mocks.can.mockReturnValue(false);

    const wrapper = mount(MenuItemComponent, {
      props: {
        menuitem: {
          label: "Test Menu Item",
          typeLink: {
            route: {
              destination: "some-path",
            },
          },
          entityType: "Hidden" as Entitytyping,
          subMenu: null,
          isLoggedIn: true,
        },
        icon: "Test" as DamsIcons,
        isExpanded: false,
        isBeingHovered: false,
      },
    });

    await flushPromises();

    const menuItem = await wrapper.find('[data-test="menu-item-component"]');
    expect(menuItem.exists()).toBe(false);
  });
});
