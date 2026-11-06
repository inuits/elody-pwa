import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import type { MenuItem } from "@/generated-types/queries";
import NavSubItem from "../NavSubItem.vue";

const mocks = vi.hoisted(() => ({ path: "/", openModal: vi.fn() }));

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
  useMenuBadges: () => ({ badgeCountOf: () => 0 }),
}));
vi.mock("@/composables/useMenuHelper", () => ({
  MenuItemType: { modal: "modal", link: "link" },
  default: () => ({
    checkIfRouteOrModal: (item: MenuItem) =>
      item.typeLink?.modal
        ? { menuItemType: "modal", action: mocks.openModal }
        : {
            menuItemType: "link",
            action: `/${item.typeLink?.route?.destination}`,
          },
  }),
}));
vi.mock("@/types", () => ({ Unicons: { Plus: { name: "plus" } } }));

const companies = {
  label: "navigation.companies",
  typeLink: { route: { destination: "companies" } },
} as unknown as MenuItem;

const newCompany = {
  label: "navigation.new-company",
  typeLink: { modal: { typeModal: "Create" } },
} as unknown as MenuItem;

const mountSubItem = (item: MenuItem) =>
  mount(NavSubItem, {
    props: { item },
    global: {
      stubs: {
        RouterLink: { props: ["to"], template: '<a :href="to"><slot /></a>' },
        unicon: true,
      },
    },
  });

describe("NavSubItem", () => {
  beforeEach(() => {
    mocks.path = "/";
    mocks.openModal.mockClear();
  });

  it("is a list item", () => {
    expect(mountSubItem(companies).element.tagName).toBe("LI");
  });

  it("links to its destination", () => {
    expect(mountSubItem(companies).find("a").attributes("href")).toBe(
      "/companies",
    );
  });

  it("is marked as the current page on its route", () => {
    mocks.path = "/companies";
    expect(mountSubItem(companies).find("a").attributes("aria-current")).toBe(
      "page",
    );
  });

  it("opens its modal from a real button", async () => {
    const button = mountSubItem(newCompany).find("button");
    expect(button.attributes("type")).toBe("button");
    await button.trigger("click");
    expect(mocks.openModal).toHaveBeenCalledOnce();
  });
});
