import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";
import MenuNav from "../MenuNav.vue";

const isExpanded = vi.hoisted(() => ({ value: false }));
const changeExpandedState = vi.hoisted(() => vi.fn());

vi.mock("@/composables/useMenuHelper", async () => {
  const { ref } = await import("vue");
  const expanded = ref(false);
  return {
    default: () => {
      expanded.value = isExpanded.value;
      return {
        getMenuEntities: vi.fn(),
        menuItems: ref([]),
        setSelectedMenuItem: vi.fn(),
        changeExpandedState,
        isExpanded: expanded,
      };
    },
  };
});
vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({ someModalIsOpened: ref(false) }),
}));
vi.mock("@/composables/useMenuBadges", () => ({
  useMenuBadges: () => ({ refreshBadges: vi.fn() }),
}));
vi.mock("vue-router", () => ({
  useRouter: () => ({ afterEach: vi.fn() }),
}));
vi.mock("@/helpers", () => ({ getEnvironmentLabel: () => "local" }));

const mountNav = (expanded = false) => {
  isExpanded.value = expanded;
  return mount(MenuNav, {
    global: {
      provide: { config: {} },
      stubs: {
        LogInLogout: true,
        Menuitem: true,
        RouterLink: { template: "<a><slot /></a>" },
      },
      mocks: { $t: (key: string) => key },
    },
  });
};

// navigation.md: 52px rail, the main navigation landmark; Round 2: the
// expanded menu opens over the content with an overlay shadow and closes on
// Escape
describe("MenuNav rail", () => {
  beforeEach(() => changeExpandedState.mockClear());

  it("is the named main navigation landmark at the rail width", () => {
    const nav = mountNav().find("nav");
    expect(nav.attributes("aria-label")).toBe("navigation.main");
    expect(nav.classes()).toContain("w-(--nav-rail-width)");
    expect(nav.classes()).not.toContain("w-24");
  });

  it("opens the expanded menu over the content with the overlay shadow", () => {
    const nav = mountNav(true).find("nav");
    expect(nav.classes()).toEqual(
      expect.arrayContaining(["w-(--nav-flyout-width)", "shadow-overlay"]),
    );
  });

  it("closes the expanded menu on Escape", async () => {
    const wrapper = mountNav(true);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(changeExpandedState).toHaveBeenCalledWith(false);
    wrapper.unmount();
  });

  it("draws the logo at the rail logo size", () => {
    expect(mountNav().find("img").classes()).toContain(
      "w-(--nav-rail-logo)",
    );
  });
});
