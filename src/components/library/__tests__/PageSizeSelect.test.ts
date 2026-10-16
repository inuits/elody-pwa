import { shallowMount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PageSizeSelect from "../PageSizeSelect.vue";
import AdvancedDropdown from "@/components/base/AdvancedDropdown.vue";

const mocks = vi.hoisted(() => ({
  state: undefined as any,
  options: [
    { label: "20", value: 20 },
    { label: "50", value: 50 },
  ],
}));

vi.mock("@/main", () => ({
  apolloClient: {
    query: vi.fn(async () => ({
      data: { PaginationLimitOptions: { options: mocks.options } },
    })),
  },
}));
vi.mock("@/composables/useStateManagement", () => ({
  useStateManagement: () => ({ getStateForRoute: () => mocks.state }),
}));
vi.mock("vue-router", () => ({ useRoute: () => ({ path: "/test" }) }));
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${Object.values(params).join(",")}` : key,
  }),
}));

const getWrapper = async (total = 100) => {
  const setLimit = vi.fn();
  const wrapper = shallowMount(PageSizeSelect, {
    props: { setLimit, selectedPaginationLimitOption: 20, total },
  });
  const [[load]] = wrapper.emitted("paginationLimitOptionsPromise") as any;
  await load();
  await flushPromises();
  return { wrapper, setLimit };
};

describe("PageSizeSelect", () => {
  beforeEach(() => {
    mocks.state = undefined;
  });

  it("labels each option as n per page", async () => {
    const { wrapper } = await getWrapper();
    expect(
      wrapper
        .findComponent(AdvancedDropdown)
        .props("options")
        .map((option: { label: string }) => option.label),
    ).toEqual(["pagination.per-page:20", "pagination.per-page:50"]);
  });

  it("names the select for screen readers", async () => {
    const { wrapper } = await getWrapper();
    const label = wrapper.find("label");
    expect(label.text()).toBe("pagination.page-size");
    expect(wrapper.findComponent(AdvancedDropdown).props("inputId")).toBe(
      label.attributes("for"),
    );
  });

  it("starts from the limit saved for the route", async () => {
    mocks.state = { queryVariables: { limit: 50 } };
    const { setLimit } = await getWrapper();
    expect(setLimit).toHaveBeenCalledWith(50);
  });

  it("falls back to the first option", async () => {
    const { setLimit } = await getWrapper();
    expect(setLimit).toHaveBeenCalledWith(20);
  });

  it("hides when every result fits on the smallest page", async () => {
    const { wrapper } = await getWrapper(4);
    expect(wrapper.findComponent(AdvancedDropdown).isVisible()).toBe(false);
  });

  it("stays when a larger page size was picked for a short list", async () => {
    const { wrapper } = await getWrapper(30);
    expect(wrapper.findComponent(AdvancedDropdown).isVisible()).toBe(true);
  });
});
