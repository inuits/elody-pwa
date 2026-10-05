import { mount } from "@vue/test-utils";
import MenuItemComponent from "../MenuItem.vue";
import { describe, it, expect, vi, afterEach } from "vitest";
import type { MenuItem, DamsIcons } from "@/generated-types/queries";
import { flushPromises } from "@vue/test-utils";
import { ref } from "vue";

vi.mock("@/components/base/BaseTooltip.vue", () => ({
  default: {
    template: '<div><slot name="activator" v-bind="{ on: {} }"/><slot/></div>',
    setup() {
      return {};
    },
  },
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
      }),
    ),
    onError: vi.fn(),
  })),
}));

vi.mock("@/types", () => ({
  Unicons: {
    Plus: { name: "plus" },
    AngleRight: { name: "angel-right" },
    AngleDown: { name: "angel-down" },
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

const mountMenuItem = (menuitem: MenuItem) =>
  mount(MenuItemComponent, {
    props: {
      menuitem,
      icon: "Test" as DamsIcons,
      isExpanded: true,
      isBeingHovered: true,
    },
  });

const routeTo = (destination: string) => ({
  route: { destination },
});

describe("MenuItem", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders an item whose config GraphQL returned", async () => {
    const wrapper = mountMenuItem({
      label: "Test Menu Item",
      typeLink: routeTo("some-path"),
      subMenu: null,
      isLoggedIn: true,
    } as MenuItem);

    await flushPromises();

    expect(
      wrapper.find('[data-test="menu-item-component"]').isVisible(),
    ).toBe(true);
  });

  it("hides a group whose children were all left out", async () => {
    const wrapper = mountMenuItem({
      label: "Organizations",
      typeLink: routeTo("venues"),
      subMenu: {
        name: "sub-menu-organizations",
        venues: null,
        companies: null,
      },
      isLoggedIn: true,
    } as unknown as MenuItem);

    await flushPromises();

    expect(
      wrapper.find('[data-test="menu-item-component"]').isVisible(),
    ).toBe(false);
  });

  it("renders a group next to the one child that survived", async () => {
    const wrapper = mountMenuItem({
      label: "Organizations",
      typeLink: routeTo("venues"),
      subMenu: {
        name: "sub-menu-organizations",
        venues: null,
        companies: {
          label: "navigation.companies",
          typeLink: routeTo("companies"),
        },
      },
      isLoggedIn: true,
    } as unknown as MenuItem);

    await flushPromises();

    expect(
      wrapper.find('[data-test="menu-item-component"]').isVisible(),
    ).toBe(true);
    const subItems = wrapper.findAll('[data-cy="menu-sub-item"]');
    expect(subItems).toHaveLength(1);
    expect(subItems[0].text()).toContain("navigation.companies");
  });

  it("renders a plain item that has no submenu at all", async () => {
    const wrapper = mountMenuItem({
      label: "Productions",
      typeLink: routeTo("productions"),
      isLoggedIn: true,
    } as MenuItem);

    await flushPromises();

    expect(
      wrapper.find('[data-test="menu-item-component"]').isVisible(),
    ).toBe(true);
    expect(wrapper.findAll('[data-cy="menu-sub-item"]')).toHaveLength(0);
  });
});
