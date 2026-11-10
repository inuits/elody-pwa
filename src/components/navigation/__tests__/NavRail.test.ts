import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import type { MenuItem } from "@/generated-types/queries";

const mocks = vi.hoisted(() => ({
  refreshBadges: vi.fn(),
  removeAfterEach: vi.fn(),
  afterEach: vi.fn(),
  getMenuEntities: vi.fn(),
}));

vi.mock("@/composables/useMenuHelper", async () => {
  const { ref } = await import("vue");
  const menuItems = ref<MenuItem[]>([]);
  return {
    default: () => ({
      getMenuEntities: mocks.getMenuEntities,
      menuItems,
    }),
  };
});
vi.mock("@/composables/useMenuBadges", () => ({
  useMenuBadges: () => ({ refreshBadges: mocks.refreshBadges }),
}));
vi.mock("vue-router", () => ({
  useRoute: () => ({ path: "/" }),
  useRouter: () => ({
    afterEach: (hook: () => void) => {
      mocks.afterEach(hook);
      return mocks.removeAfterEach;
    },
  }),
}));
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, values?: Record<string, string>) =>
      values ? `${key} ${Object.values(values).join(" ")}` : key,
  }),
}));
vi.mock("@/main", () => ({ auth: { isAuthenticated: { value: true } } }));
vi.mock("@/helpers", () => ({ getEnvironmentLabel: () => "local" }));
vi.mock("@/types", () => ({ Unicons: {} }));
vi.mock("@/components/LanguageSelect.vue", () => ({
  default: { template: '<div data-cy="language-select" />' },
}));
vi.mock("@/components/menu/TenantSwitcher.vue", () => ({
  default: { template: '<div data-cy="tenant-switcher" />' },
}));

const library = {
  label: "library",
  typeLink: { route: { destination: "library" } },
} as unknown as MenuItem;
const organizations = {
  label: "organizations",
  typeLink: { route: { destination: "venues" } },
  subMenu: {
    name: "sub",
    companies: {
      label: "companies",
      typeLink: { route: { destination: "companies" } },
    },
  },
} as unknown as MenuItem;
const people = {
  ...organizations,
  label: "people",
} as unknown as MenuItem;

const NavItemStub = {
  props: ["item", "expanded", "open"],
  emits: ["toggle", "close"],
  template:
    '<li data-cy="menu-item" :data-open="open" :data-flyout-open="(open && !expanded) || undefined"><button type="button" aria-expanded="false" @click="$emit(\'toggle\')">{{ item.label }}</button><span v-if="open && !expanded" data-test="flyout-link" tabindex="0">link</span></li>',
};

let wrapper: VueWrapper | undefined;

const mountRail = async () => {
  const { default: NavRail } = await import("../NavRail.vue");
  const useMenuHelper = (await import("@/composables/useMenuHelper")).default;
  useMenuHelper().menuItems.value = [library, organizations, people];
  wrapper = mount(NavRail, {
    attachTo: document.body,
    global: {
      provide: { config: {} },
      stubs: {
        NavItem: NavItemStub,
        LogInLogout: true,
        RouterLink: { template: "<a><slot /></a>" },
        unicon: true,
      },
    },
  });
  await nextTick();
  return wrapper;
};

const nav = () => wrapper!.find("nav");
const isWide = () => nav().classes().includes("w-(--nav-flyout-width)");
const modeButton = () => wrapper!.find('[data-cy="nav-mode-toggle"]');

const setMode = async (mode: string) => {
  const { useNavMenu } = await import("@/composables/useNavMenu");
  useNavMenu().setMode(mode as never);
};

const navMenu = async () =>
  (await import("@/composables/useNavMenu")).useNavMenu();

describe("NavRail", () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    localStorage.clear();
    vi.clearAllMocks();
    await setMode("collapsed");
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
    vi.useRealTimers();
  });

  it("is the named main navigation landmark", async () => {
    await mountRail();
    expect(nav().attributes("aria-label")).toBe("navigation.main");
  });

  it("is separated from the page by a subtle border, open or closed", async () => {
    await mountRail();
    expect(nav().classes()).toEqual(
      expect.arrayContaining(["border-r", "border-border-subtle"]),
    );
    await setMode("expanded");
    await nextTick();
    expect(nav().classes()).toEqual(
      expect.arrayContaining(["border-r", "border-border-subtle"]),
    );
  });

  it("lists the menu items in a list", async () => {
    await mountRail();
    expect(
      wrapper!.findAll('[data-cy="menu-nav-items"] > [data-cy="menu-item"]'),
    ).toHaveLength(3);
    expect(wrapper!.find('[data-cy="menu-nav-items"]').element.tagName).toBe(
      "UL",
    );
  });

  it("loads the menu once", async () => {
    await mountRail();
    expect(mocks.getMenuEntities).toHaveBeenCalledOnce();
  });

  describe("on the closed rail", () => {
    const groupButton = (index = 1) =>
      wrapper!.findAll('[data-cy="menu-item"] button')[index];
    const isFlyoutOpen = (index = 1) =>
      wrapper!
        .findAll('[data-cy="menu-item"]')
        [index].attributes("data-flyout-open") === "true";

    it("does not open on hover", async () => {
      await mountRail();
      await nav().trigger("mouseenter");
      vi.runAllTimers();
      await nextTick();
      expect(isWide()).toBe(false);
    });

    it("does not open when keyboard focus enters", async () => {
      await mountRail();
      await groupButton().trigger("focusin");
      expect(isWide()).toBe(false);
    });

    it("opens a group's flyout and stays closed itself", async () => {
      await mountRail();
      await groupButton().trigger("click");
      expect(isFlyoutOpen()).toBe(true);
      expect(isWide()).toBe(false);
    });

    it("closes the flyout when its group is clicked again", async () => {
      await mountRail();
      await groupButton().trigger("click");
      await groupButton().trigger("click");
      expect(isFlyoutOpen()).toBe(false);
    });

    it("closes the flyout on Escape and returns focus to its group", async () => {
      await mountRail();
      await groupButton().trigger("click");
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await nextTick();
      expect(isFlyoutOpen()).toBe(false);
      expect(document.activeElement).toBe(groupButton().element);
    });

    it("leaves Escape to whatever outside the menu has focus", async () => {
      await mountRail();
      await groupButton().trigger("click");
      const outside = document.createElement("button");
      document.body.appendChild(outside);
      outside.focus();
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await nextTick();
      expect(isFlyoutOpen()).toBe(true);
      expect(document.activeElement).toBe(outside);
      outside.remove();
    });

    it("rises above page overlays while a flyout is open", async () => {
      await mountRail();
      expect(nav().classes()).toContain("z-navigation");
      await groupButton().trigger("click");
      expect(nav().classes()).toContain("z-context-menu");
      expect(nav().classes()).not.toContain("z-navigation");
    });

    it("closes the flyout on a click outside it", async () => {
      await mountRail();
      await groupButton().trigger("click");
      document.body.dispatchEvent(
        new MouseEvent("pointerdown", { bubbles: true }),
      );
      await nextTick();
      expect(isFlyoutOpen()).toBe(false);
    });

    it("keeps the flyout open on a click inside it", async () => {
      await mountRail();
      await groupButton().trigger("click");
      wrapper!
        .find('[data-test="flyout-link"]')
        .element.dispatchEvent(
          new MouseEvent("pointerdown", { bubbles: true }),
        );
      await nextTick();
      expect(isFlyoutOpen()).toBe(true);
    });

    it("closes the flyout when focus moves to another item", async () => {
      await mountRail();
      await groupButton().trigger("click");
      await nav().trigger("focusout", {
        relatedTarget: groupButton(2).element,
      });
      expect(isFlyoutOpen()).toBe(false);
    });

    it("keeps the flyout open while focus moves inside it", async () => {
      await mountRail();
      await groupButton().trigger("click");
      await nav().trigger("focusout", {
        relatedTarget: wrapper!.find('[data-test="flyout-link"]').element,
      });
      expect(isFlyoutOpen()).toBe(true);
    });

    it("closes the flyout when it asks to", async () => {
      await mountRail();
      await groupButton().trigger("click");
      wrapper!.findAllComponents(NavItemStub)[1].vm.$emit("close");
      await nextTick();
      expect(isFlyoutOpen()).toBe(false);
    });

    it("closes the flyout after navigating", async () => {
      await mountRail();
      await groupButton().trigger("click");
      mocks.afterEach.mock.calls[0][0]();
      await nextTick();
      expect(isFlyoutOpen()).toBe(false);
    });
  });

  describe("when fixed open", () => {
    beforeEach(() => setMode("expanded"));

    it("is open without interaction", async () => {
      await mountRail();
      expect(isWide()).toBe(true);
    });

    it("casts no shadow, since it sits beside the page", async () => {
      await mountRail();
      expect(nav().classes()).not.toContain("shadow-overlay");
    });

    it("stays open on Escape", async () => {
      await mountRail();
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await nextTick();
      expect(isWide()).toBe(true);
    });

    it("stays open on a click outside", async () => {
      await mountRail();
      document.body.dispatchEvent(
        new MouseEvent("pointerdown", { bubbles: true }),
      );
      await nextTick();
      expect(isWide()).toBe(true);
    });

    it("keeps an inline group open after navigating", async () => {
      await mountRail();
      await wrapper!
        .findAll('[data-cy="menu-item"] button')[1]
        .trigger("click");
      mocks.afterEach.mock.calls[0][0]();
      await nextTick();
      expect(
        wrapper!.findAll('[data-cy="menu-item"]')[1].attributes("data-open"),
      ).toBe("true");
    });
  });

  describe("navigation", () => {
    it("refreshes the badges after navigating", async () => {
      await mountRail();
      mocks.afterEach.mock.calls[0][0]();
      expect(mocks.refreshBadges).toHaveBeenCalled();
    });

    it("stops listening to navigation when removed", async () => {
      await mountRail();
      wrapper!.unmount();
      wrapper = undefined;
      expect(mocks.removeAfterEach).toHaveBeenCalledOnce();
    });
  });

  describe("groups", () => {
    beforeEach(() => setMode("expanded"));

    it("opens one group at a time", async () => {
      await mountRail();
      const buttons = wrapper!.findAll('[data-cy="menu-item"] button');
      await buttons[1].trigger("click");
      await buttons[2].trigger("click");
      const items = wrapper!.findAll('[data-cy="menu-item"]');
      expect(items[1].attributes("data-open")).toBe("false");
      expect(items[2].attributes("data-open")).toBe("true");
    });

    it("closes an open group when clicked again", async () => {
      await mountRail();
      const button = wrapper!.findAll('[data-cy="menu-item"] button')[1];
      await button.trigger("click");
      await button.trigger("click");
      expect(
        wrapper!.findAll('[data-cy="menu-item"]')[1].attributes("data-open"),
      ).toBe("false");
    });
  });

  describe("mode toggle", () => {
    it("sits at the top, before the menu items", async () => {
      await mountRail();
      const items = wrapper!.find('[data-cy="menu-nav-items"]').element;
      expect(
        modeButton().element.compareDocumentPosition(items) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    });

    it("is an icon button named by what it does, open or closed", async () => {
      await setMode("expanded");
      await mountRail();
      expect(modeButton().text()).toBe("");
    });

    it("offers to keep the menu open while closed", async () => {
      await mountRail();
      expect(modeButton().attributes("aria-label")).toBe(
        "navigation.menu-mode.expand",
      );
    });

    it("offers to collapse the menu while it is fixed open", async () => {
      await setMode("expanded");
      await mountRail();
      expect(modeButton().attributes("aria-label")).toBe(
        "navigation.menu-mode.collapse",
      );
    });

    it("fixes the menu open", async () => {
      await mountRail();
      await modeButton().trigger("click");
      expect(isWide()).toBe(true);
    });

    it("collapses the menu", async () => {
      await setMode("expanded");
      await mountRail();
      await modeButton().trigger("click");
      expect(isWide()).toBe(false);
    });
  });

  describe("on a small screen", () => {
    const closeButton = () => wrapper!.find('[data-cy="nav-drawer-close"]');
    const isDrawerHidden = () => nav().attributes("inert") !== undefined;

    beforeEach(async () => {
      const menu = await navMenu();
      menu.isCompact.value = true;
      menu.closeDrawer();
    });

    afterEach(async () => {
      (await navMenu()).isCompact.value = false;
    });

    it("is a hidden, unreachable drawer until opened", async () => {
      await mountRail();
      expect(isDrawerHidden()).toBe(true);
      expect(nav().classes()).toContain("-translate-x-full");
    });

    it("slides in over the page when opened", async () => {
      await mountRail();
      (await navMenu()).openDrawer();
      await nextTick();
      expect(isDrawerHidden()).toBe(false);
      expect(nav().classes()).not.toContain("-translate-x-full");
      expect(nav().classes()).toContain("shadow-overlay");
    });

    it("shows the items with their labels, groups inline", async () => {
      await mountRail();
      expect(
        wrapper!
          .findAllComponents(NavItemStub)
          .every((item) => item.props("expanded")),
      ).toBe(true);
    });

    it("offers a close button instead of the mode toggle", async () => {
      await mountRail();
      expect(modeButton().exists()).toBe(false);
      expect(closeButton().attributes("aria-label")).toBe(
        "navigation.close-menu",
      );
    });

    describe("closes", () => {
      beforeEach(async () => {
        await mountRail();
        (await navMenu()).openDrawer();
        await nextTick();
      });

      it("from its close button", async () => {
        await closeButton().trigger("click");
        expect(isDrawerHidden()).toBe(true);
      });

      it("on a click on the backdrop", async () => {
        await wrapper!.find('[data-cy="nav-drawer-backdrop"]').trigger("click");
        expect(isDrawerHidden()).toBe(true);
      });

      it("on Escape", async () => {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
        await nextTick();
        expect(isDrawerHidden()).toBe(true);
      });

      it("after navigating", async () => {
        mocks.afterEach.mock.calls[0][0]();
        await nextTick();
        expect(isDrawerHidden()).toBe(true);
      });
    });

    it("has no backdrop while closed", async () => {
      await mountRail();
      expect(wrapper!.find('[data-cy="nav-drawer-backdrop"]').exists()).toBe(
        false,
      );
    });

    it("holds the language switcher and the full account row", async () => {
      await mountRail();
      expect(wrapper!.find('[data-cy="language-select"]').exists()).toBe(true);
      expect(
        wrapper!.findComponent({ name: "LogInLogout" }).props("isExpanded"),
      ).toBe(true);
    });
  });

  it("leaves the language switcher in the page header on a wide screen", async () => {
    await mountRail();
    expect(wrapper!.find('[data-cy="language-select"]').exists()).toBe(false);
  });
});
