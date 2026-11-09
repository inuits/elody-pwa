import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import type { MenuItem } from "@/generated-types/queries";

const mocks = vi.hoisted(() => ({ badgeCounts: {} as Record<string, number> }));

vi.mock("@/composables/useMenuHelper", async () => {
  const { ref } = await import("vue");
  const menuItems = ref<MenuItem[]>([]);
  return { default: () => ({ menuItems }) };
});
vi.mock("@/composables/useMenuBadges", () => ({
  useMenuBadges: () => ({
    totalBadgeCountOf: (item: MenuItem) => mocks.badgeCounts[item.label!] ?? 0,
  }),
}));
vi.mock("vue-router", () => ({ useRoute: () => ({ path: "/" }) }));
vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));
vi.mock("@/main", () => ({ auth: { isAuthenticated: { value: true } } }));
vi.mock("@/helpers", () => ({ getEnvironmentLabel: () => "local" }));
vi.mock("@/components/SearchBar.vue", () => ({
  default: { template: "<button />" },
}));

const library = { label: "library" } as MenuItem;
const notifications = { label: "notifications" } as MenuItem;

let wrapper: VueWrapper | undefined;

const mountBar = async () => {
  const { default: MobileTopBar } = await import("../MobileTopBar.vue");
  const useMenuHelper = (await import("@/composables/useMenuHelper")).default;
  useMenuHelper().menuItems.value = [library, notifications];
  wrapper = mount(MobileTopBar, {
    global: {
      stubs: { RouterLink: { template: "<a><slot /></a>" }, unicon: true },
    },
  });
  return wrapper;
};

const navMenu = async () =>
  (await import("@/composables/useNavMenu")).useNavMenu();
const menuButton = () => wrapper!.find('[data-cy="nav-drawer-open"]');
const badgeDot = () => wrapper!.find('[data-test="menu-badge-dot"]');

describe("MobileTopBar", () => {
  beforeEach(async () => {
    mocks.badgeCounts = {};
    (await navMenu()).closeDrawer();
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
  });

  it("opens the menu drawer", async () => {
    await mountBar();
    expect(menuButton().attributes("aria-expanded")).toBe("false");
    await menuButton().trigger("click");
    expect((await navMenu()).isDrawerOpen.value).toBe(true);
    expect(menuButton().attributes("aria-expanded")).toBe("true");
  });

  it("names the menu button by what it does", async () => {
    await mountBar();
    expect(menuButton().attributes("aria-label")).toBe("navigation.open-menu");
  });

  it("marks the menu button while a menu item has a badge", async () => {
    mocks.badgeCounts = { notifications: 3 };
    await mountBar();
    await nextTick();
    expect(badgeDot().exists()).toBe(true);
  });

  it("has no mark without badges", async () => {
    await mountBar();
    expect(badgeDot().exists()).toBe(false);
  });
});
