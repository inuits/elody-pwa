import { describe, it, expect, vi, afterEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import HomeWrapper from "../HomeWrapper.vue";
import { usePageStatus } from "@/composables/usePageStatus";
import { PageStatus } from "@/generated-types/queries";

vi.mock("vue-router", () => ({
  useRoute: () => ({ name: "Works", meta: {} }),
  useRouter: () => undefined,
}));

vi.mock("@/components/library/AssetLibrary.vue", () => ({
  default: { name: "AssetLibrary", template: "<div />" },
}));
vi.mock("@/views/Home.vue", () => ({
  default: { name: "Home", template: "<div />" },
}));
vi.mock("@/views/errorViews/AccessDenied.vue", () => ({
  default: { name: "AccessDenied", template: "<div />" },
}));
vi.mock("@/views/errorViews/Unauthorized.vue", () => ({
  default: { name: "Unauthorized", template: "<div />" },
}));

describe("HomeWrapper", () => {
  afterEach(() => usePageStatus().resetPageStatus());

  it("shows the overview library while the page status is fine", () => {
    const wrapper = shallowMount(HomeWrapper);

    expect(wrapper.findComponent({ name: "AssetLibrary" }).exists()).toBe(true);
  });

  it.each([
    [PageStatus.Forbidden, "AccessDenied"],
    [PageStatus.Unauthorized, "Unauthorized"],
  ])("shows the %s status page instead of the overview", (status, page) => {
    usePageStatus().setPageStatus(status);

    const wrapper = shallowMount(HomeWrapper);

    expect(wrapper.findComponent({ name: page }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: "AssetLibrary" }).exists()).toBe(
      false,
    );
  });
});
