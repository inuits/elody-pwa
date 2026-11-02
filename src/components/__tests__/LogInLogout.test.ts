import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { ref, shallowRef } from "vue";

const mocks = vi.hoisted(() => ({
  isAuthenticated: { value: true },
  redirectToLogin: vi.fn(),
  performLogout: vi.fn(),
  confirm: vi.fn(),
}));
const elodyUser = shallowRef<{ id: string } | null>(null);

vi.mock("@/main", () => ({
  auth: {
    isAuthenticated: mocks.isAuthenticated,
    redirectToLogin: mocks.redirectToLogin,
  },
}));
vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key, locale: ref("en") }),
}));
vi.mock("@/composables/useAuth", () => ({
  useAuth: () => ({
    performLogout: mocks.performLogout,
    getUserName: () => "Ada",
    elodyUser,
  }),
}));
vi.mock("@/composables/useConfirmModal", () => ({
  useConfirmModal: () => ({ confirm: mocks.confirm }),
}));

import LogInLogout from "@/components/LogInLogout.vue";

const mountRail = (isExpanded = false) =>
  mount(LogInLogout, {
    props: { isExpanded },
    global: {
      stubs: {
        unicon: true,
        RouterLink: {
          props: ["to"],
          template: `<a data-router-link :href="to"><slot /></a>`,
        },
        BaseTooltip: {
          template: `<div><slot name="activator" :on="{}" /><slot /></div>`,
        },
      },
    },
  });

describe("LogInLogout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isAuthenticated.value = true;
    elodyUser.value = null;
  });

  it("shows the profile in the collapsed rail even without an Elody user record", () => {
    const profile = mountRail().find('[data-cy="profile"]');

    expect(profile.exists()).toBe(true);
    expect(profile.attributes("aria-label")).toBe("Ada");
    expect(profile.attributes("data-router-link")).toBeUndefined();
  });

  it("links the collapsed profile to the user page when there is one", () => {
    elodyUser.value = { id: "u-1" };

    const profile = mountRail().find('[data-cy="profile"]');

    expect(profile.attributes("data-router-link")).toBeDefined();
    expect(profile.attributes("href")).toBe("/user/u-1");
  });

  it("logs out from a named button after confirming", async () => {
    mocks.confirm.mockResolvedValue("confirm");
    const logout = mountRail().find('[data-cy="log-out"]');

    expect(logout.element.tagName).toBe("BUTTON");
    expect(logout.attributes("aria-label")).toBe("navigation.log-out");
    await logout.trigger("click");
    await flushPromises();

    expect(mocks.performLogout).toHaveBeenCalled();
  });

  it("logs in from a named button when signed out", async () => {
    mocks.isAuthenticated.value = false;
    const login = mountRail().find('[data-cy="log-in"]');

    expect(login.element.tagName).toBe("BUTTON");
    expect(login.attributes("aria-label")).toBe("navigation.log-in");
    await login.trigger("click");

    expect(mocks.redirectToLogin).toHaveBeenCalled();
  });

  it("names profile and logout in text when the menu is expanded", () => {
    const wrapper = mountRail(true);

    expect(wrapper.find('[data-cy="profile"]').text()).toBe("Ada");
    expect(wrapper.find('[data-cy="log-out"]').text()).toBe(
      "navigation.log-out",
    );
  });
});

// navigation.md: the footer rows are rail items like the menu items
describe("LogInLogout rail rows", () => {
  it("sizes and centres the collapsed rows as rail items", () => {
    const wrapper = mountRail(false);
    expect(wrapper.classes()).toContain("items-center");
    expect(wrapper.find('[data-cy="log-out"]').classes()).toEqual(
      expect.arrayContaining([
        "w-(--nav-rail-item-width)",
        "h-(--nav-rail-item-height)",
        "text-text-muted",
        "hover:bg-accent-highlight",
      ]),
    );
  });

  it("stretches the expanded rows to the menu width", () => {
    const row = mountRail(true).find('[data-cy="log-out"]');
    expect(row.classes()).toContain("w-full");
    expect(row.classes()).not.toContain("w-(--nav-rail-item-width)");
  });
});
