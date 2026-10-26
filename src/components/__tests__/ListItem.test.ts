import ListItem from "../ListItem.vue";
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";
import MultilingualWrapper from "@/components/metadata/MultilingualWrapper.vue";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import type { SeenTracking } from "@/types/contextMenuRouteConfig";

const mockSeenItems = vi.hoisted(() => ({
  markAsSeen: vi.fn(),
  markManyAsSeen: vi.fn(),
  unmarkManyAsSeen: vi.fn(),
}));

const mockSeenState = vi.hoisted(() => ({
  tracking: undefined as unknown,
  isSeen: vi.fn<(id: string) => boolean>(() => false),
  isNew: vi.fn<(id: string, values?: Record<string, unknown>) => boolean>(
    () => false,
  ),
}));

vi.mock("@/composables/useSeenItems", () => ({
  useSeenItems: () => mockSeenItems,
  useSeenState: (tracking: unknown) => {
    mockSeenState.tracking = tracking;
    return mockSeenState;
  },
}));

const mockEntityPageConfig = vi.hoisted(() => ({
  actions: { value: [] },
  hasEditMetadataButton: { value: undefined },
  deleteButton: { value: undefined },
  seenTracking: { value: undefined as SeenTracking | undefined },
}));

vi.mock("@/composables/useEntityPageConfig", () => ({
  useEntityPageConfig: () => mockEntityPageConfig,
}));

vi.mock("@/helpers", async () => {
  const actualModule = await vi.importActual("@/helpers");
  return {
    ...actualModule,
    setCssVariable: () => {},
    getEntityPageRoute: () => {},
    getMappedSlug: () => {},
    formatTeaserMetadata: () => {},
    updateEntityMediafileOnlyForMediafiles: () => {},
    stringIsUrl: () => false,
    asString: (v: any) => v?.toString() ?? "",
  };
});

vi.mock("@/main", () => ({
  auth: { isAuthenticated: { value: true } },
  router: {
    currentRoute: { value: { params: { id: "test" } } },
  },
}));

vi.mock("@/composables/useEdit", () => ({
  useEditMode: () => ({ isEdit: false, showErrors: false }),
}));

vi.mock("@/composables/useEntitySingle", () => ({
  default: () => ({ getEntityUuid: () => "test-uuid" }),
}));

vi.mock("@/composables/useListItemHelper", () => ({
  hoveredListItem: { value: "" },
  useListItemHelper: () => ({ getMediaFilenameFromEntity: () => "" }),
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

describe("ListItem", () => {
  beforeEach(() => {
    mockEntityPageConfig.seenTracking.value = undefined;
    mockSeenState.isSeen.mockImplementation(() => false);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  const defaultProps = {
    bulkOperationsContext: undefined,
    relation: "no-relation-found" as const,
    hasSelection: false,
    previewComponentEnabled: false,
    previewComponentCurrentActive: false,
    previewComponentFeatureEnabled: false,
    viewMode: "list" as const,
    teaserMetadata: [],
  };

  describe("seen items", () => {
    const seenItemProps = {
      ...defaultProps,
      itemId: "seen-item",
      hasSelection: true,
    };

    const markItemAsSeen = () => {
      mockEntityPageConfig.seenTracking.value = { display: "dimSeen" };
      mockSeenState.isSeen.mockImplementation(
        (id: string) => id === "seen-item",
      );
    };

    it("shows a seen item's title in secondary ink", () => {
      markItemAsSeen();

      const wrapper = shallowMount(ListItem, {
        props: {
          ...seenItemProps,
          teaserMetadata: [
            { key: "title", value: "Seen" },
            { key: "type", value: "Book" },
          ] as any,
        },
      });
      const fields = wrapper.findAll("[data-cy='list-item-content'] > div");

      expect(fields[0].classes()).toContain("text-text-secondary");
      expect(fields[1].classes()).not.toContain("text-text-secondary");
    });

    it("does not grey out a seen item like a disabled one", () => {
      markItemAsSeen();

      const wrapper = shallowMount(ListItem, { props: seenItemProps });

      expect(wrapper.find("[data-cy='list-item']").classes()).not.toContain(
        "grayscale",
      );
    });

    it("keeps the selection checkbox visible for a seen item", () => {
      markItemAsSeen();

      const wrapper = shallowMount(ListItem, { props: seenItemProps });

      const checkbox = wrapper.findComponent(BaseInputCheckbox);
      expect(checkbox.exists()).toBe(true);
      expect(checkbox.classes()).not.toContain("invisible");
    });

    it("does not grey out an item that has not been seen", () => {
      mockEntityPageConfig.seenTracking.value = { display: "dimSeen" };

      const wrapper = shallowMount(ListItem, { props: seenItemProps });

      expect(wrapper.find("[data-cy='list-item']").classes()).not.toContain(
        "grayscale",
      );
    });

    it("uses the seen tracking of the current route", () => {
      shallowMount(ListItem, { props: seenItemProps });

      expect(mockSeenState.tracking).toBe(mockEntityPageConfig.seenTracking);
    });

    it("still hides the selection checkbox for a disabled item", () => {
      const wrapper = shallowMount(ListItem, {
        props: { ...seenItemProps, isDisabled: true },
      });

      const checkbox = wrapper.findComponent(BaseInputCheckbox);
      expect(checkbox.exists()).toBe(true);
      expect(checkbox.classes()).toContain("invisible");
      expect(wrapper.find("[data-cy='list-item']").classes()).toContain(
        "grayscale",
      );
    });
  });

  describe("new items", () => {
    const newItemProps = {
      ...defaultProps,
      itemId: "new-item",
      intialValues: { last_activity_at: "2026-10-09T10:00:00Z" },
    };

    beforeEach(() => {
      mockEntityPageConfig.seenTracking.value = {
        display: "highlightNew",
        activityKey: "last_activity_at",
        ttlDays: 30,
      };
    });

    it("highlights an item with activity that was not seen yet", () => {
      mockSeenState.isNew.mockImplementation((id: string) => id === "new-item");

      const wrapper = shallowMount(ListItem, { props: newItemProps });

      expect(wrapper.find("[data-cy='list-item']").classes()).toContain(
        "font-semibold",
      );
      expect(wrapper.find("[data-cy='new-indicator']").exists()).toBe(true);
      expect(mockSeenState.isNew).toHaveBeenCalledWith("new-item", {
        last_activity_at: "2026-10-09T10:00:00Z",
      });
    });

    it("does not highlight an item without new activity", () => {
      mockSeenState.isNew.mockImplementation(() => false);

      const wrapper = shallowMount(ListItem, { props: newItemProps });

      expect(wrapper.find("[data-cy='list-item']").classes()).not.toContain(
        "font-semibold",
      );
      expect(wrapper.find("[data-cy='new-indicator']").exists()).toBe(false);
    });
  });

  describe("multiLine prop", () => {
    it("defaults multiLine to false", () => {
      const wrapper = shallowMount(ListItem, {
        props: defaultProps,
      });
      expect(wrapper.props("multiLine")).toBe(false);
    });

    it("renders metadata container with flex items-center but without grid when multiLine is false", () => {
      const wrapper = shallowMount(ListItem, {
        props: {
          ...defaultProps,
          multiLine: false,
        },
      });
      const metadataContainer = wrapper.find("[data-cy='list-item-content']");
      expect(metadataContainer.exists()).toBe(true);
      expect(metadataContainer.classes()).toContain("flex");
      expect(metadataContainer.classes()).toContain("items-center");
      expect(metadataContainer.classes()).not.toContain("grid");
    });

    it("renders metadata container with grid classes when multiLine is true", () => {
      const wrapper = shallowMount(ListItem, {
        props: {
          ...defaultProps,
          multiLine: true,
        },
      });
      const metadataContainer = wrapper.find("[data-cy='list-item-content']");
      expect(metadataContainer.exists()).toBe(true);
      expect(metadataContainer.classes()).toContain("grid");
      expect(metadataContainer.classes()).toContain("gap-x-4");
      expect(metadataContainer.classes()).toContain("gap-y-3");
      expect(metadataContainer.classes()).toContain("items-start");
      expect(metadataContainer.classes()).not.toContain("flex");
    });

    it("applies grid-column span style when metadata item has colSpan in multiLine mode", () => {
      const wrapper = shallowMount(ListItem, {
        props: {
          ...defaultProps,
          multiLine: true,
          teaserMetadata: [
            { key: "field1", colSpan: "2", value: { value: "test" } },
          ],
        },
      });
      const metadataItems = wrapper.findAll("[data-cy='list-item-content'] > div");
      expect(metadataItems.length).toBeGreaterThan(0);
      expect(metadataItems[0].attributes("style")).toContain(
        "grid-column: span 2",
      );
    });

    it("does not apply grid-column span style when multiLine is false", () => {
      const wrapper = shallowMount(ListItem, {
        props: {
          ...defaultProps,
          multiLine: false,
          teaserMetadata: [
            { key: "field1", colSpan: "2", value: { value: "test" } },
          ],
        },
      });
      const metadataItems = wrapper.findAll("[data-cy='list-item-content'] > div");
      expect(metadataItems.length).toBeGreaterThan(0);
      expect(metadataItems[0].attributes("style")).toBeFalsy();
    });
  });

  describe("values on the relation to the page's entity", () => {
    const refetchEntities = vi.fn();
    const mountWith = (teaserMetadata: any[]) =>
      shallowMount(ListItem, {
        props: {
          ...defaultProps,
          itemId: "USER-1",
          relationValues: { refOrganizations: [{ key: "test-uuid" }] },
          refetchEntities,
          teaserMetadata,
        },
        global: { renderStubDefaultSlot: true },
      });

    it("lets a field with an input be edited in place on the row", () => {
      const field = mountWith([
        { key: "roles", value: "admin", inputField: { type: "dropdownSingleselectMetadata" } },
      ]).findComponent({ name: "ListItemInlineField" });
      expect(field.exists()).toBe(true);
      expect(field.props()).toMatchObject({
        parentEntityId: "test-uuid",
        linkedEntityId: "USER-1",
        linkedEntityRelations: { refOrganizations: [{ key: "test-uuid" }] },
        refetchEntities,
      });
    });

    it("leaves a field without an input as it was", () => {
      expect(
        mountWith([{ key: "email", value: "a@b.c" }])
          .findComponent({ name: "ListItemInlineField" })
          .exists(),
      ).toBe(false);
    });
  });

  describe("multilingual teaser metadata", () => {
    it("scopes each row's translations to its own entity, not the page form", () => {
      // otherwise switching the page entity's locale overwrites every row
      const wrapper = shallowMount(ListItem, {
        props: {
          ...defaultProps,
          itemId: "WBI-1",
          teaserMetadata: [{ key: "name", isMultilingual: true, value: [] }],
        },
      });

      const wrappers = wrapper.findAllComponents(MultilingualWrapper);
      expect(wrappers.length).toBeGreaterThan(0);
      for (const multilingual of wrappers)
        // not the entity id itself: the edit modal reads translations stored there on save
        expect(multilingual.props("formId")).toBe("WBI-1_listitem");
    });
  });

  describe("loading state", () => {
    it("stops pulsing once the parent finished loading, even when a context menu action toggled loading around the fetch", async () => {
      const wrapper = shallowMount(ListItem, {
        props: { ...defaultProps, loading: false },
      });

      // action starts -> toggle on, parent refetch -> loading, fetch resolves,
      // action's finally -> toggle off
      wrapper.vm.toggleLoading();
      await wrapper.setProps({ loading: true });
      await wrapper.setProps({ loading: false });
      wrapper.vm.toggleLoading();
      await wrapper.vm.$nextTick();

      expect(wrapper.find("[data-cy='list-item']").classes()).not.toContain(
        "animate-pulse",
      );
    });

    it("pulses while the parent is loading", async () => {
      const wrapper = shallowMount(ListItem, {
        props: { ...defaultProps, loading: true },
      });
      expect(wrapper.find("[data-cy='list-item']").classes()).toContain(
        "animate-pulse",
      );
    });
  });

  describe("row controls", () => {
    it("toggles the preview from a real eye button", async () => {
      const wrapper = shallowMount(ListItem, {
        props: {
          ...defaultProps,
          itemId: "row-1",
          baseLibraryMode: "normalBaseLibrary" as any,
          previewComponentFeatureEnabled: true,
        },
      });
      const toggle = wrapper.findComponent({ name: "PreviewToggle" });

      toggle.vm.$emit("toggle");

      expect(wrapper.emitted("togglePreviewComponent")?.[0]).toEqual(["row-1"]);
    });

    it("keeps the eye while a preview is open", () => {
      const wrapper = shallowMount(ListItem, {
        props: {
          ...defaultProps,
          itemId: "row-1",
          baseLibraryMode: "normalBaseLibrary" as any,
          previewComponentFeatureEnabled: true,
          previewComponentEnabled: true,
          isEnableNavigation: true,
        },
      });

      expect(wrapper.findComponent({ name: "PreviewToggle" }).exists()).toBe(
        true,
      );
      expect(wrapper.find('[data-cy="list-item-open"]').exists()).toBe(false);
    });
  });

  it("uses the compact checkbox in its dense rows", () => {
    const wrapper = shallowMount(ListItem, {
      props: {
        ...defaultProps,
        itemId: "row-1",
        baseLibraryMode: "normalBaseLibrary" as any,
        hasSelection: true,
      },
    });
    expect(wrapper.findComponent(BaseInputCheckbox).props("size")).toBe(
      "compact",
    );
  });

  describe("row states", () => {
    const rowProps = {
      ...defaultProps,
      itemId: "row-1",
      baseLibraryMode: "normalBaseLibrary" as any,
      hasSelection: true,
      previewComponentFeatureEnabled: true,
      previewComponentListItemsCoverage: "OneListItem" as any,
    };
    const row = (wrapper: ReturnType<typeof shallowMount>) =>
      wrapper.find("[data-cy='list-item']");

    it("fills on hover", () => {
      const wrapper = shallowMount(ListItem, { props: rowProps });
      expect(row(wrapper).classes()).toContain("hover:bg-surface-row-hover");
    });

    it("washes a selected row with an accent row shadow", async () => {
      const wrapper = shallowMount(ListItem, { props: rowProps });

      await wrapper
        .findComponent(BaseInputCheckbox)
        .vm.$emit("update:modelValue", true);

      expect(row(wrapper).classes()).toEqual(
        expect.arrayContaining(["bg-accent-wash", "shadow-accent-row"]),
      );
    });

    it("marks the previewed row with an accent left border and no wash", () => {
      const wrapper = shallowMount(ListItem, {
        props: { ...rowProps, previewComponentCurrentActive: true },
      });

      expect(row(wrapper).classes()).toEqual(
        expect.arrayContaining([
          "border-l-(length:--list-row-preview-border)",
          "border-l-accent",
        ]),
      );
      expect(row(wrapper).classes()).not.toContain("bg-accent-wash");
      expect(row(wrapper).classes()).not.toContain("border-neutral-800");
    });

    it("presses the eye only while the row's preview is open", () => {
      const lastPreviewed = shallowMount(ListItem, {
        props: { ...rowProps, previewComponentCurrentActive: true },
      });
      const open = shallowMount(ListItem, {
        props: {
          ...rowProps,
          previewComponentCurrentActive: true,
          previewOpen: true,
        },
      });

      expect(
        lastPreviewed.findComponent({ name: "PreviewToggle" }).props("active"),
      ).toBe(false);
      expect(
        open.findComponent({ name: "PreviewToggle" }).props("active"),
      ).toBe(true);
    });
  });

  describe("list column header", () => {
    it("keeps cell labels for screen readers only when the list has a header row", () => {
      const content = shallowMount(ListItem, {
        props: { ...defaultProps, itemId: "row-1", hideLabels: true },
      }).find('[data-cy="list-item-content"]');

      expect(content.classes()).toContain(
        "[&_[data-cy=metadata-label]]:sr-only",
      );
    });

    it("shows cell labels without a header row", () => {
      const content = shallowMount(ListItem, {
        props: { ...defaultProps, itemId: "row-1" },
      }).find('[data-cy="list-item-content"]');

      expect(content.classes()).not.toContain(
        "[&_[data-cy=metadata-label]]:sr-only",
      );
    });
  });

  describe("grid cards", () => {
    const card = (props = {}) =>
      shallowMount(ListItem, {
        props: { ...defaultProps, itemId: "card-1", viewMode: "grid", ...props },
      });

    it("has a fixed card size", () => {
      expect(card().find('[data-cy="list-item"]').classes()).toEqual(
        expect.arrayContaining([
          "w-(--grid-card-width)",
          "h-(--grid-card-height)",
        ]),
      );
    });

    it("always shows a media area, with a placeholder when there is no media", () => {
      const media = card().find('[data-cy="grid-card-media"]');
      expect(media.classes()).toEqual(
        expect.arrayContaining(["h-(--grid-card-media-height)", "bg-surface-muted"]),
      );
      expect(media.text()).toContain("library.no-media");
    });

    it("letterboxes the thumbnail instead of cropping it square", () => {
      const viewer = card({ media: "file.jpg" }).findComponent({
        name: "ImageViewer",
      });
      expect(viewer.props("url")).toContain("/full/");
    });

    it("shows the title, badges and one secondary line", () => {
      const fields = card({
        teaserMetadata: [
          { key: "title", value: "A title" },
          { key: "type", value: "photo" },
          { key: "status", value: { formatter: "pill" } },
          { key: "credit", value: "Someone" },
        ],
      }).findAll('[data-cy="list-item-content"] > div');

      expect(fields.map((field) => field.classes().includes("hidden"))).toEqual(
        [false, false, false, true],
      );
    });

    it("shows the first field as a two-line title", () => {
      const fields = card({
        teaserMetadata: [
          { key: "title", value: "A title" },
          { key: "type", value: "Book" },
        ],
      }).findAll('[data-cy="list-item-content"] > div');
      expect(fields[0].classes()).toEqual(
        expect.arrayContaining(["line-clamp-2", "font-bold", "text-value"]),
      );
      expect(fields[1].classes()).toContain("text-text-secondary");
    });
  });

  describe("flat rows", () => {
    const rowOf = (viewMode: "list" | "grid") =>
      shallowMount(ListItem, {
        props: { ...defaultProps, itemId: "row-1", viewMode },
      }).find('[data-cy="list-item"]');

    it("separates list rows with a faint hairline instead of a card border", () => {
      const classes = rowOf("list").classes();
      expect(classes).toEqual(
        expect.arrayContaining([
          "border-b",
          "border-border-faint",
          "p-(--list-row-pad)",
          "text-table",
        ]),
      );
      expect(classes).not.toContain("rounded");
      expect(classes).not.toContain("mb-2");
    });

    it("keeps grid items as bordered cards", () => {
      expect(rowOf("grid").classes()).toEqual(
        expect.arrayContaining(["border", "rounded-card"]),
      );
    });
  });

  describe("narrow list rows", () => {
    const listRow = () =>
      shallowMount(ListItem, {
        props: { ...defaultProps, itemId: "row-1", viewMode: "list" as const },
      });

    it("lets its actions wrap onto their own line", () => {
      expect(listRow().find('[data-cy="list-item"]').classes()).toContain(
        "flex-wrap",
      );
    });

    it("keeps the text column at a readable minimum before wrapping", () => {
      expect(
        listRow().find('[data-cy="list-item-content"]').classes(),
      ).toEqual(
        expect.arrayContaining([
          "flex-1",
          "basis-(--list-row-content-min)",
          "min-w-0",
        ]),
      );
    });

    it("right-aligns the actions when they wrap", () => {
      expect(
        listRow().find('[data-cy="list-item-actions"]').classes(),
      ).toContain("ml-auto");
    });
  });
});
