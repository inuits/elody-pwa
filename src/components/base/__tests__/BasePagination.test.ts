import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import BasePagination from "../BasePagination.vue";
import {
  createPaginationStore,
  pageItems,
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

const pageButtons = (wrapper: ReturnType<typeof getWrapper>["wrapper"]) =>
  wrapper.findAll('[data-cy="pager-page"]').map((b) => b.text());

describe("pageItems", () => {
  it("lists every page when there are few", () => {
    expect(pageItems(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("keeps the first, last and neighbours of the current page, with gaps", () => {
    expect(pageItems(10, 63)).toEqual([1, "…", 9, 10, 11, "…", 63]);
  });

  it("shows a single hidden page instead of an ellipsis", () => {
    expect(pageItems(4, 63)).toEqual([1, 2, 3, 4, 5, "…", 63]);
  });

  it("returns nothing for an empty list", () => {
    expect(pageItems(1, 0)).toEqual([]);
  });
});

describe("BasePagination", () => {
  it("is a navigation landmark", () => {
    const nav = getWrapper(100).wrapper.find("nav");
    expect(nav.attributes("aria-label")).toBe("pagination.label");
  });

  it("marks the current page", () => {
    const current = getWrapper(100, 3).wrapper.find('[aria-current="page"]');
    expect(current.text()).toBe("3");
  });

  it("disables previous on the first page", () => {
    const { wrapper } = getWrapper(100, 1);
    expect(
      wrapper.find('[data-cy="pager-previous"]').attributes("disabled"),
    ).toBeDefined();
    expect(
      wrapper.find('[data-cy="pager-next"]').attributes("disabled"),
    ).toBeUndefined();
  });

  it("disables next on the last page", () => {
    const { wrapper } = getWrapper(100, 5);
    expect(
      wrapper.find('[data-cy="pager-next"]').attributes("disabled"),
    ).toBeDefined();
  });

  it("goes to the clicked page", async () => {
    const { wrapper, store } = getWrapper(100, 1);
    const page5 = wrapper
      .findAll('[data-cy="pager-page"]')
      .find((button) => button.text() === "5");
    await page5!.trigger("click");
    expect(store.currentPage.value).toBe(5);
  });

  it("names the arrow buttons", () => {
    const { wrapper } = getWrapper(100, 2);
    expect(
      wrapper.find('[data-cy="pager-previous"]').attributes("aria-label"),
    ).toBe("pagination.previous");
    expect(
      wrapper.find('[data-cy="pager-next"]').attributes("aria-label"),
    ).toBe("pagination.next");
  });

  it("marks the last page as an estimate when the count is capped", () => {
    // 1001 is the backend's "more than 1000" sentinel: 50 pages of 20.
    const { wrapper } = getWrapper(1001, 1);
    expect(pageButtons(wrapper).at(-1)).toBe("50+");
  });

  it("moves focus between pager buttons with the arrow keys", async () => {
    const { wrapper } = getWrapper(100, 1);
    document.body.appendChild(wrapper.element);
    const buttons = wrapper.findAll("button:not([disabled])");
    (buttons[0].element as HTMLElement).focus();

    await wrapper.find("nav").trigger("keydown", { key: "ArrowRight" });

    expect(document.activeElement).toBe(buttons[1].element);
    wrapper.unmount();
  });
});
