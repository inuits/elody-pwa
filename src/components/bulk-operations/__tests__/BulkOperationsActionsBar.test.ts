import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ref } from "vue";
import BulkOperationsActionsBar from "../BulkOperationsActionsBar.vue";
import type { Entitytyping } from "@/generated-types/queries";

const mocks = vi.hoisted(() => ({
  selected: [] as { id: string }[],
  dequeueAll: vi.fn(),
  operations: [] as unknown[],
  handle: vi.fn(),
  hasSelectionOperations: true,
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
    bulkOperations: ref(mocks.operations),
    selectedBulkOperation: ref(undefined),
    bulkOperationsPromiseIsResolved: ref(true),
    hasBulkOperationsWithItemsSelection: ref(mocks.hasSelectionOperations),
    itemsSelected: ref(mocks.selected.length > 0),
    subDropdownOptions: ref([]),
    clearSubDropdownOptions: vi.fn(),
    handleSelectedBulkOperation: mocks.handle,
    getEnqueuedItemCount: () => mocks.selected.length,
    getEnqueuedItems: () => mocks.selected,
    dequeueAllItemsForBulkProcessing: mocks.dequeueAll,
  }),
}));

const getWrapper = (props: Record<string, unknown> = {}) =>
  mount(BulkOperationsActionsBar, {
    props: {
      context: "home" as any,
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
    mocks.operations = [];
    mocks.hasSelectionOperations = true;
    vi.clearAllMocks();
  });

  it("is a toolbar named after the selection", () => {
    const bar = getWrapper().find('[role="toolbar"]');

    expect(bar.attributes("aria-label")).toBe(
      "bulk-operations.selection-toolbar",
    );
  });

  it("announces the selection count as a live status", () => {
    mocks.selected = [{ id: "a" }];

    expect(getWrapper().find('[role="status"]').text()).toBe(
      "bulk-operations.selection-count:1",
    );
  });

  it("keeps the live region mounted but empty without a selection", () => {
    expect(getWrapper().find('[role="status"]').text()).toBe("");
  });

  it("sits in the list's results band without a surface of its own", () => {
    const classes = getWrapper().find('[role="toolbar"]').classes();
    expect(classes).toEqual(
      expect.arrayContaining(["gap-(--selection-bar-gap)", "text-ui"]),
    );
    expect(classes).not.toContain("border");
    expect(classes).not.toContain("bg-surface");
  });

  it("hides when it has nothing to offer (no selection, no actions)", () => {
    mocks.hasSelectionOperations = false;
    expect(getWrapper().find('[role="toolbar"]').isVisible()).toBe(false);
  });

  it("shows when there are actions without a selection", () => {
    mocks.hasSelectionOperations = false;
    mocks.operations = [{ value: "create" }];
    expect(getWrapper().find('[role="toolbar"]').isVisible()).toBe(true);
  });

  it("leaves the total to the list header count chip", () => {
    expect(getWrapper().text()).not.toContain("bulk-operations.items");
  });

  it("styles select page and clear selection as label links", () => {
    mocks.selected = [{ id: "a" }];
    const links = getWrapper().findAll('[data-cy="selection-bar-link"]');

    expect(links).toHaveLength(2);
    links.forEach((link) =>
      expect(link.classes()).toEqual(
        expect.arrayContaining(["text-label", "text-text-light", "underline"]),
      ),
    );
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
      .find((button) => button.text() === "bulk-operations.clear-selection");

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

  describe("create in the page header", () => {
    const create = {
      value: "createEntity",
      label: "navigation.create-inscription",
      primary: true,
    };
    const exportXlsx = { value: "exportXlsx", label: "bulk-operations.export" };

    beforeEach(() => {
      mocks.operations = [create, exportXlsx];
    });

    const mountBar = (createInPageHeader: boolean) =>
      mount(BulkOperationsActionsBar, {
        props: {
          context: "home" as any,
          useExtendedBulkOperations: true,
          entityType: "inscription" as Entitytyping,
          refetchEntities: () => {},
          selectedPaginationLimitOption: 20,
          excludePagination: true,
          createInPageHeader,
        },
        global: {
          stubs: {
            ActionMenuGroup: true,
            BaseTooltip: true,
            Unicon: true,
            teleport: true,
          },
          mocks: { $t: (key: string) => key },
        },
      });

    it("moves the create action out of the bar into a page-header pill", async () => {
      const wrapper = mountBar(true);
      const pill = wrapper.find('[data-cy="page-header-create"]');

      expect(pill.text()).toBe("navigation.create-inscription");
      expect(
        wrapper.findComponent({ name: "ActionMenuGroup" }).props("options"),
      ).toEqual([exportXlsx]);
      await pill.trigger("click");
      expect(mocks.handle).toHaveBeenCalledWith(create);
    });

    it("keeps create in the bar for other lists", () => {
      const wrapper = mountBar(false);
      expect(wrapper.find('[data-cy="page-header-create"]').exists()).toBe(false);
      expect(
        wrapper.findComponent({ name: "ActionMenuGroup" }).props("options"),
      ).toEqual([create, exportXlsx]);
    });
  });
});
