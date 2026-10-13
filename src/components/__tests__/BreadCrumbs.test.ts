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

const clickOverview = async () => {
  const wrapper = mount(BreadCrumbs, {
    global: {
      provide: { config: {} },
      stubs: { unicon: true, MetadataFormatter: true, CustomIcon: true },
    },
  });
  const crumb = wrapper.findAll("p").find((p) => p.text() === "Werken")!;
  await crumb.trigger("click");
  await flushPromises();
};

describe("BreadCrumbs", () => {
  beforeEach(() => {
    mocks.push.mockReset();
    mocks.clearBreadcrumbPathAndAddOverviewPage.mockReset();
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
