import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import BasePagination from "../BasePagination.vue";
import {
  createPaginationStore,
  PaginationStoreKey,
} from "@/components/library/usePaginationStore";

const getWrapper = (total: number, page = 1) => {
  const store = createPaginationStore();
  store.updateTotalAmount(total);
  store.goToPage(page);
  const wrapper = mount(BasePagination, {
    global: {
      provide: { [PaginationStoreKey as symbol]: store },
      stubs: { BaseTooltip: true, Unicon: true },
      mocks: { $t: (key: string) => key },
    },
  });
  return { wrapper, store };
};

const button = (wrapper: ReturnType<typeof getWrapper>["wrapper"], cy: string) =>
  wrapper.find(`[data-cy="pager-${cy}"]`);

describe("BasePagination", () => {
  it("is a navigation landmark", () => {
    const nav = getWrapper(100).wrapper.find("nav");
    expect(nav.attributes("aria-label")).toBe("pagination.label");
  });

  it("reads 'page [n] of N' like the list-screen template", () => {
    const { wrapper } = getWrapper(100, 3);
    expect(wrapper.find("input").element.value).toBe("3");
    expect(wrapper.text()).toContain("pagination.page");
    expect(wrapper.text()).toContain("pagination.of");
    expect(wrapper.find('[data-cy="pager-last-page"]').text()).toBe("5");
  });

  it("names every arrow button", () => {
    const { wrapper } = getWrapper(100, 3);
    expect(
      ["first", "previous", "next", "last"].map((cy) =>
        button(wrapper, cy).attributes("aria-label"),
      ),
    ).toEqual([
      "pagination.first",
      "pagination.previous",
      "pagination.next",
      "pagination.last",
    ]);
  });

  it("disables first and previous on the first page", () => {
    const { wrapper } = getWrapper(100, 1);
    expect(button(wrapper, "first").attributes("disabled")).toBeDefined();
    expect(button(wrapper, "previous").attributes("disabled")).toBeDefined();
    expect(button(wrapper, "next").attributes("disabled")).toBeUndefined();
  });

  it("disables next and last on the last page", () => {
    const { wrapper } = getWrapper(100, 5);
    expect(button(wrapper, "next").attributes("disabled")).toBeDefined();
    expect(button(wrapper, "last").attributes("disabled")).toBeDefined();
  });

  it("jumps to the last page", async () => {
    const { wrapper, store } = getWrapper(100, 1);
    await button(wrapper, "last").trigger("click");
    expect(store.currentPage.value).toBe(5);
  });

  it("goes to the page typed in the box on Enter", async () => {
    const { wrapper, store } = getWrapper(100, 1);
    const input = wrapper.find("input");
    await input.setValue("4");
    await input.trigger("keyup", { key: "Enter" });
    await flushPromises();
    expect(store.currentPage.value).toBe(4);
  });

  it("names the page box", () => {
    expect(
      getWrapper(100).wrapper.find("input").attributes("aria-label"),
    ).toBe("pagination.page-number");
  });

  it("marks the last page as an estimate when the count is capped", () => {
    // 1001 is the backend's "more than 1000" sentinel: 50 pages of 20.
    const { wrapper } = getWrapper(1001, 1);
    expect(wrapper.find('[data-cy="pager-last-page"]').text()).toBe("50+");
  });
});
