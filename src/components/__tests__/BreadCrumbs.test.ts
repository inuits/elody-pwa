import { beforeEach, describe, expect, it, vi } from "vitest";
import { flushPromises, mount } from "@vue/test-utils";
import { ref } from "vue";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  clearBreadcrumbPathAndAddOverviewPage: vi.fn(),
}));

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: mocks.push, replace: vi.fn(), beforeEach: vi.fn() }),
}));
vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key, locale: ref("en") }),
}));
vi.mock("@/composables/useBreadcrumbs", async () => {
  const { ref, computed } = await import("vue");
  const breadcrumbRoutes = ref([
    { id: "", overviewPage: "Works", title: "Werken", type: "" },
  ]);
  return {
    breadcrumbRoutes,
    rootRoute: ref({ rootTitle: "Work 1" }),
    useBreadcrumbs: () => ({
      clearBreadcrumbPathAndAddOverviewPage:
        mocks.clearBreadcrumbPathAndAddOverviewPage,
      previousRoute: computed(() => breadcrumbRoutes.value[0]),
    }),
  };
});
vi.mock("@/composables/useEdit", () => ({
  useEditMode: () => ({ isEdit: false }),
}));
vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({ discardEditForForm: vi.fn() }),
}));
vi.mock("@/composables/useConfirmModal", () => ({
  useConfirmModal: () => ({ confirm: vi.fn() }),
}));

import BreadCrumbs from "@/components/BreadCrumbs.vue";
import { breadcrumbRoutes } from "@/composables/useBreadcrumbs";

const overview = { id: "", overviewPage: "Works", title: "Werken", type: "" };

const mountCrumbs = () =>
  mount(BreadCrumbs, {
    global: {
      provide: { config: {} },
      stubs: { unicon: true, MetadataFormatter: true, CustomIcon: true },
    },
  });

const clickOverview = async () => {
  const wrapper = mountCrumbs();
  const crumb = wrapper
    .findAll("button")
    .find((button) => button.text() === "Werken")!;
  await crumb.trigger("click");
  await flushPromises();
};

describe("BreadCrumbs", () => {
  beforeEach(() => {
    mocks.push.mockReset();
    mocks.clearBreadcrumbPathAndAddOverviewPage.mockReset();
    (breadcrumbRoutes as any).value = [overview];
  });

  // Catalogue Breadcrumb: capsules in a navigation landmark.
  it("renders the trail as a breadcrumb landmark ending on the current page", () => {
    const wrapper = mountCrumbs();

    expect(wrapper.find("nav").attributes("aria-label")).toBe(
      "navigation.breadcrumb",
    );
    const current = wrapper.find('[aria-current="page"]');
    expect(current.text()).toBe("Work 1");
    expect(current.classes()).toEqual(
      expect.arrayContaining(["rounded-pill", "bg-surface-muted"]),
    );
  });

  it("opens the earlier steps from a named history button", async () => {
    (breadcrumbRoutes as any).value = [
      overview,
      { id: "a", title: "Asset A", type: "asset" },
      { id: "b", title: "Asset B", type: "asset" },
    ];
    const wrapper = mountCrumbs();
    const toggle = wrapper.find('[data-cy="breadcrumb-history"]');

    expect(toggle.element.tagName).toBe("BUTTON");
    expect(toggle.text()).toContain("2");
    expect(toggle.attributes("aria-expanded")).toBe("false");
    expect(toggle.attributes("aria-label")).toBe("navigation.breadcrumb-history");

    await toggle.trigger("click");

    expect(toggle.attributes("aria-expanded")).toBe("true");
    expect(
      wrapper.findAll('[data-cy="breadcrumb-history-item"]').map((b) => b.text()),
    ).toEqual(["Asset A", "Werken"]);
  });

  it("resets the path to the overview page, under its title, once the navigation succeeds", async () => {
    mocks.push.mockResolvedValue(undefined);
    await clickOverview();
    expect(mocks.push).toHaveBeenCalledWith({ name: "Works" });
    expect(mocks.clearBreadcrumbPathAndAddOverviewPage).toHaveBeenCalledWith(
      "Werken",
    );
  });

  // A leave prompt (unsaved changes) can cancel the navigation: the page and
  // its breadcrumbs stay as they were.
  it("keeps the path when the navigation is cancelled", async () => {
    mocks.push.mockResolvedValue({ type: 4 });
    await clickOverview();
    expect(mocks.clearBreadcrumbPathAndAddOverviewPage).not.toHaveBeenCalled();
  });
});
