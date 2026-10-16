import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import BulkOperationsActionsBar from "../BulkOperationsActionsBar.vue";
import type { Entitytyping } from "@/generated-types/queries";

const mocks = vi.hoisted(() => ({
  selected: [] as { id: string }[],
  dequeueAll: vi.fn(),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${Object.values(params).join(",")}` : key,
    locale: ref("en"),
  }),
}));

vi.mock("@/composables/useBulkOperationsActionsBar", () => ({
  useBulkOperationsActionsBar: () => ({
    bulkOperations: ref([]),
    selectedBulkOperation: ref(undefined),
    bulkOperationsPromiseIsResolved: ref(true),
    hasBulkOperationsWithItemsSelection: ref(true),
    itemsSelected: ref(mocks.selected.length > 0),
    subDropdownOptions: ref([]),
    clearSubDropdownOptions: vi.fn(),
    handleSelectedBulkOperation: vi.fn(),
    getEnqueuedItemCount: () => mocks.selected.length,
    getEnqueuedItems: () => mocks.selected,
    dequeueAllItemsForBulkProcessing: mocks.dequeueAll,
  }),
}));

const getWrapper = (props: Record<string, unknown> = {}) =>
  mount(BulkOperationsActionsBar, {
    props: {
      context: "home" as any,
      totalItemsCount: 40,
      useExtendedBulkOperations: true,
      entityType: "inscription" as Entitytyping,
      refetchEntities: () => {},
      selectedPaginationLimitOption: 20,
      excludePagination: true,
      ...props,
    },
    global: {
      stubs: { ActionMenuGroup: true, BaseTooltip: true, Unicon: true },
      mocks: { $t: (key: string) => key },
    },
  });

describe("BulkOperationsActionsBar", () => {
  beforeEach(() => {
    mocks.selected = [];
    vi.clearAllMocks();
  });

  it("is a toolbar named after the selection", () => {
    const bar = getWrapper().find('[role="toolbar"]');

    expect(bar.attributes("aria-label")).toBe(
      "bulk-operations.selection-toolbar",
    );
  });

  it("announces the count as a live status", () => {
    mocks.selected = [{ id: "a" }];

    expect(getWrapper().find('[role="status"]').text()).toContain("1/");
  });

  it("notes selected items that sit on other pages", () => {
    mocks.selected = [{ id: "a" }, { id: "b" }, { id: "c" }];

    const note = getWrapper({ pageItemIds: ["a"] }).find(
      '[data-cy="selection-off-page-note"]',
    );

    expect(note.text()).toBe("bulk-operations.selected-on-other-pages:2");
  });

  it("leaves the note out when every selected item is on this page", () => {
    mocks.selected = [{ id: "a" }];

    expect(
      getWrapper({ pageItemIds: ["a", "b"] })
        .find('[data-cy="selection-off-page-note"]')
        .exists(),
    ).toBe(false);
  });

  it("clears the selection from a real button", async () => {
    mocks.selected = [{ id: "a" }];
    const clear = getWrapper()
      .findAll("button")
      .find((button) => button.text() === "bulk-operations.undo-selection");

    await clear!.trigger("click");

    expect(mocks.dequeueAll).toHaveBeenCalled();
  });

  it("selects the page from a real button", async () => {
    const wrapper = getWrapper();
    const selectPage = wrapper
      .findAll("button")
      .find((button) => button.text() === "bulk-operations.select-page");

    await selectPage!.trigger("click");

    expect(wrapper.emitted("selectPage")).toHaveLength(1);
  });
});
