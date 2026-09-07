import { mount } from "@vue/test-utils";
import MenuSubItem from "../MenuSubItem.vue";
import { describe, it, expect, vi, afterEach } from "vitest";
import type { Entitytyping, MenuItem } from "@/generated-types/queries";
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
      }),
    ),
    onError: vi.fn(),
  })),
}));

vi.mock("@/types", () => ({
  Unicons: {
    Plus: { name: "plus" },
  },
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

  it("renders an item whose config GraphQL returned", async () => {
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

  it("renders an item that carries no advanced permission when 'show' is true", async () => {
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

  it("hides the item when 'show' is false", async () => {
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
