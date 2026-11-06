import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import type { MenuItem } from "@/generated-types/queries";
import NavItem from "../NavItem.vue";

const mocks = vi.hoisted(() => ({
  path: "/",
  badge: 0,
  openModal: vi.fn(),
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({
    get path() {
      return mocks.path;
    },
  }),
}));
vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));
vi.mock("@/main", () => ({ auth: { isAuthenticated: { value: true } } }));
vi.mock("@/composables/useMenuBadges", () => ({
  useMenuBadges: () => ({
    totalBadgeCountOf: () => mocks.badge,
    badgeCountOf: () => 0,
  }),
}));
vi.mock("@/composables/useMenuHelper", () => ({
  MenuItemType: { modal: "modal", link: "link" },
  default: () => ({
    checkIfRouteOrModal: (item: MenuItem) =>
      item.typeLink?.modal
        ? { menuItemType: "modal", action: mocks.openModal }
        : item.subMenu
          ? undefined
          : {
              menuItemType: "link",
              action: `/${item.typeLink?.route?.destination}`,
            },
  }),
}));
vi.mock("@/types", () => ({
  Unicons: {
    Books: { name: "books" },
    AngleDown: { name: "angle-down" },
    AngleRight: { name: "angle-right" },
    Plus: { name: "plus" },
  },
}));
vi.mock("@/components/base/BaseTooltip.vue", () => ({
  default: {
    props: ["showDelay"],
    template:
      '<div :data-show-delay="showDelay"><slot name="activator" v-bind="{ on: {}, describedBy: \'tip\' }"/><div data-test="tooltip"><slot/></div></div>',
  },
}));

const libraryLink = {
  label: "navigation.library",
  icon: "Books",
  typeLink: { route: { destination: "library" } },
} as unknown as MenuItem;

const uploadModal = {
  label: "navigation.upload",
  icon: "Books",
  typeLink: { modal: { typeModal: "Upload" } },
} as unknown as MenuItem;

const organizationsGroup = {
  label: "navigation.organizations",
  icon: "Books",
  typeLink: { route: { destination: "venues" } },
  subMenu: {
    name: "sub-menu-organizations",
    companies: {
      label: "navigation.companies",
      typeLink: { route: { destination: "companies" } },
    },
  },
} as unknown as MenuItem;

const mountItem = (
  item: MenuItem,
  props: Partial<{ expanded: boolean; open: boolean }> = {},
) =>
  mount(NavItem, {
    props: { item, expanded: true, open: false, ...props },
    global: {
      stubs: {
        RouterLink: {
          props: ["to"],
          template: '<a :href="to"><slot /></a>',
        },
        unicon: true,
        CustomIcon: true,
      },
    },
  });

describe("NavItem", () => {
  beforeEach(() => {
    mocks.path = "/";
    mocks.badge = 0;
    mocks.openModal.mockClear();
  });

  describe("a link", () => {
    it("navigates to its destination", () => {
      const link = mountItem(libraryLink).find("a");
      expect(link.attributes("href")).toBe("/library");
    });

    it("is marked as the current page on its route", () => {
      mocks.path = "/tenant/library";
      const link = mountItem(libraryLink).find("a");
      expect(link.attributes("aria-current")).toBe("page");
    });

    it("is not marked current on another route", () => {
      const link = mountItem(libraryLink).find("a");
      expect(link.attributes("aria-current")).toBeUndefined();
    });

    it("draws its icon", () => {
      expect(
        mountItem(libraryLink).find('unicon-stub[name="books"]').exists(),
      ).toBe(true);
    });

    it("shows its label in the expanded menu", () => {
      const label = mountItem(libraryLink).find('[data-test="nav-label"]');
      expect(label.classes()).not.toContain("sr-only");
    });

    it("keeps its label for screen readers on the collapsed rail", () => {
      const wrapper = mountItem(libraryLink, { expanded: false });
      expect(wrapper.find('[data-test="nav-label"]').classes()).toContain(
        "sr-only",
      );
    });

    it("shows its name in a tooltip on the closed rail", () => {
      expect(
        mountItem(libraryLink, { expanded: false })
          .find('[data-test="tooltip"]')
          .text(),
      ).toBe("navigation.library");
    });

    it("shows its tooltip without delay", () => {
      expect(
        mountItem(libraryLink, { expanded: false })
          .find("[data-show-delay]")
          .attributes("data-show-delay"),
      ).toBe("0");
    });

    it("shows no tooltip in the open menu", () => {
      expect(mountItem(libraryLink).find('[data-test="tooltip"]').text()).toBe(
        "",
      );
    });

    it("shows its badge count", () => {
      mocks.badge = 3;
      expect(mountItem(libraryLink).find('[data-cy="menu-badge"]').text()).toBe(
        "3",
      );
    });
  });

  describe("a modal item", () => {
    it("is a real button that opens its modal", async () => {
      const button = mountItem(uploadModal).find("button");
      expect(button.attributes("type")).toBe("button");
      await button.trigger("click");
      expect(mocks.openModal).toHaveBeenCalledOnce();
    });
  });

  describe("a group", () => {
    it("is a disclosure button reporting whether it is open", () => {
      const closed = mountItem(organizationsGroup).find("button");
      const open = mountItem(organizationsGroup, { open: true }).find("button");
      expect(closed.attributes("aria-expanded")).toBe("false");
      expect(open.attributes("aria-expanded")).toBe("true");
    });

    it("asks to toggle when clicked", async () => {
      const wrapper = mountItem(organizationsGroup);
      await wrapper.find("button").trigger("click");
      expect(wrapper.emitted("toggle")).toHaveLength(1);
    });

    it("controls the list of its sub-items", () => {
      const wrapper = mountItem(organizationsGroup, { open: true });
      const listId = wrapper.find("button").attributes("aria-controls");
      expect(wrapper.find(`ul#${listId}`).exists()).toBe(true);
    });

    it("lists its sub-items inline while open in the open menu", () => {
      const wrapper = mountItem(organizationsGroup, { open: true });
      expect(wrapper.findAll('[data-cy="menu-sub-item"]')).toHaveLength(1);
      expect(wrapper.find('[data-cy="nav-flyout"]').exists()).toBe(false);
    });

    it("lists nothing while closed", () => {
      expect(
        mountItem(organizationsGroup)
          .find('[data-cy="menu-sub-item"]')
          .exists(),
      ).toBe(false);
    });

    describe("on the closed rail", () => {
      const mountFlyout = () =>
        mountItem(organizationsGroup, { open: true, expanded: false });

      it("shows its sub-items in a flyout", () => {
        const flyout = mountFlyout().find('[data-cy="nav-flyout"]');
        expect(flyout.findAll('[data-cy="menu-sub-item"]')).toHaveLength(1);
      });

      it("titles the flyout with the group name", () => {
        expect(
          mountFlyout().find('[data-test="nav-flyout-title"]').text(),
        ).toBe("navigation.organizations");
      });

      it("is the flyout the group button controls", () => {
        const wrapper = mountFlyout();
        const id = wrapper.find("button").attributes("aria-controls");
        expect(wrapper.find('[data-cy="nav-flyout"]').attributes("id")).toBe(
          id,
        );
      });

      it("asks to close the flyout once a sub-item is picked", async () => {
        const wrapper = mountFlyout();
        await wrapper.find('[data-cy="menu-sub-item"] a').trigger("click");
        expect(wrapper.emitted("close")).toHaveLength(1);
      });

      it("hides its tooltip while the flyout is open", () => {
        expect(mountFlyout().find('[data-test="tooltip"]').text()).toBe("");
      });
    });

    it("is marked current while one of its sub-items is the page", () => {
      mocks.path = "/companies";
      const button = mountItem(organizationsGroup).find("button");
      expect(button.classes()).toContain("bg-accent-light");
    });
  });
});
