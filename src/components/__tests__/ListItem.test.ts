import ListItem from "../ListItem.vue";
import BaseInputCheckbox from "@/components/base/BaseInputCheckbox.vue";
import MultilingualWrapper from "@/components/metadata/MultilingualWrapper.vue";
import ListItemEditableValue from "@/components/ListItemEditableValue.vue";
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import type { SeenTracking } from "@/types/contextMenuRouteConfig";
import { isCompact } from "@/composables/useNavMenu";
import { rowSheetKey } from "@/components/context-menu-actions/rowSheet";

vi.mock("@/composables/useNavMenu", async () => {
  const { ref } = await import("vue");
  return { isCompact: ref(false) };
});

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
  useI18n: () => ({ t: (key: string) => key, te: () => true }),
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

  // ui_kits/clients list: the title cell is 13px bold link ink, the rest secondary.
  describe("row title", () => {
    const fieldsOf = (teaserMetadata: any[]) =>
      shallowMount(ListItem, {
        props: { ...defaultProps, itemId: "item", teaserMetadata },
      }).findAll("[data-cy='list-item-content'] > div");

    it("sets the first field as the row title and the others in secondary ink", () => {
      const fields = fieldsOf([
        { key: "title", value: "AICAP0001" },
        { key: "script", value: "SC-1" },
      ]);

      expect(fields[0].classes()).toEqual(
        expect.arrayContaining([
          "font-bold",
          "text-value",
          "text-text-link",
          // the value component sets its own secondary ink
          "[&_[data-cy=entity-element-metadata]]:text-inherit",
        ]),
      );
      expect(fields[1].classes()).toContain("text-text-secondary");
      expect(fields[1].classes()).not.toContain("font-bold");
    });

    it("leaves a leading pill as it is", () => {
      const fields = fieldsOf([
        { key: "type", value: { formatter: "pill", label: "Book" } },
        { key: "title", value: "Oasis" },
      ]);

      expect(fields[0].classes()).not.toContain("font-bold");
    });

    it("underlines the title, dashed", () => {
      const fields = fieldsOf([
        { key: "title", value: "Oasis" },
        { key: "script", value: "SC-1" },
      ]);

      expect(fields[0].classes()).toEqual(
        expect.arrayContaining([
          "[&_[data-cy=metadata-value]]:underline",
          "[&_[data-cy=metadata-value]]:decoration-dashed",
        ]),
      );
      expect(fields[1].classes()).not.toContain(
        "[&_[data-cy=metadata-value]]:underline",
      );
    });

    it("does not underline a leading pill", () => {
      const fields = fieldsOf([
        { key: "type", value: { formatter: "pill", label: "Book" } },
        { key: "title", value: "Oasis" },
      ]);

      expect(fields[0].classes()).not.toContain(
        "[&_[data-cy=metadata-value]]:underline",
      );
    });
  });

  describe("highlight", () => {
    it("shows the highlight label as a chip", () => {
      const wrapper = shallowMount(ListItem, {
        props: { ...defaultProps, itemId: "e1", highlightLabel: "my-label" },
      });

      const badge = wrapper.find("[data-cy='list-item-highlight']");
      expect(badge.exists()).toBe(true);
      expect(badge.text()).toBe("my-label");
      expect(badge.classes()).toEqual(
        expect.arrayContaining(["text-chip", "rounded-chip", "p-(--chip-padding)"]),
      );
    });

    it("shows no badge without a highlight label", () => {
      const wrapper = shallowMount(ListItem, {
        props: { ...defaultProps, itemId: "e1" },
      });

      expect(wrapper.find("[data-cy='list-item-highlight']").exists()).toBe(
        false,
      );
    });
  });

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
      expect(fields[0].classes()).not.toContain("text-text-link");
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

  describe("click-to-edit teaser metadata", () => {
    const mountWithField = (field: Record<string, unknown>) =>
      shallowMount(ListItem, {
        props: {
          ...defaultProps,
          itemId: "notification-1",
          entityTypename: "notification" as any,
          teaserMetadata: [
            { key: "status", value: { value: "open" }, ...field },
          ],
        },
        global: {
          stubs: {
            MultilingualWrapper: {
              template: "<div><slot :localizedMetadata='undefined' /></div>",
            },
          },
        },
      });

    it("makes a value with an editFormQuery editable for the row's entity", () => {
      const editable = mountWithField({
        editFormQuery: "GetEditNotificationStatusForm",
      }).findComponent(ListItemEditableValue);

      expect(editable.exists()).toBe(true);
      expect(editable.props()).toMatchObject({
        editFormQuery: "GetEditNotificationStatusForm",
        metadata: expect.objectContaining({
          editFormQuery: "GetEditNotificationStatusForm",
        }),
        entityId: "notification-1",
      });
    });

    it("keeps a value read-only when the user may not edit it", () => {
      const wrapper = mountWithField({
        editFormQuery: "GetEditNotificationStatusForm",
        readOnly: true,
      });

      expect(wrapper.findComponent(ListItemEditableValue).exists()).toBe(
        false,
      );
    });

    it("keeps a value without an editFormQuery read-only", () => {
      expect(
        mountWithField({}).findComponent(ListItemEditableValue).exists(),
      ).toBe(false);
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

    describe("on a small screen", () => {
      const mountRow = (props: Record<string, unknown> = {}) =>
        shallowMount(ListItem, {
          props: {
            ...defaultProps,
            itemId: "row-1",
            baseLibraryMode: "normalBaseLibrary" as any,
            previewComponentFeatureEnabled: true,
            media: "sheep.jpg",
            buttons: { contextMenu: { delete: { label: "delete" } } } as any,
            ...props,
          },
        });

      beforeEach(() => {
        isCompact.value = true;
      });
      afterEach(() => {
        isCompact.value = false;
      });

      it("drops the eye: Preview leads the ⋮ sheet", () => {
        expect(mountRow().findComponent({ name: "PreviewToggle" }).exists())
          .toBe(false);
      });

      it("keeps the eye on a row without a ⋮", () => {
        expect(
          mountRow({ buttons: undefined })
            .findComponent({ name: "PreviewToggle" })
            .exists(),
        ).toBe(true);
      });

      it("hands its sheet the file and its preview", () => {
        const wrapper = mountRow();
        const sheet = (wrapper.vm.$ as any).provides[rowSheetKey].value;

        expect(sheet.id).toBe("row-1");
        expect(sheet.thumbnailUrl).toBe(
          "/api/iiif/3/sheep.jpg/square/^100,/0/default.jpg",
        );
        sheet.preview();
        expect(wrapper.emitted("togglePreviewComponent")?.[0]).toEqual([
          "row-1",
        ]);
      });

      it("offers no preview where the list has none", () => {
        const sheet = (
          mountRow({ previewComponentFeatureEnabled: false }).vm.$ as any
        ).provides[rowSheetKey].value;

        expect(sheet.preview).toBeUndefined();
      });
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

    // the column header puts the label over the first row's cell; a type
    // badge cell was as narrow as "E", cutting "Main type" to "M…"
    it("keeps a leading badge cell at least as wide as its header label", () => {
      const cell = shallowMount(ListItem, {
        props: {
          ...defaultProps,
          itemId: "row-1",
          hideLabels: true,
          teaserMetadata: [
            { key: "type", label: "metadata.labels.main-type", value: { formatter: "pill", label: "E" } },
            { key: "title", value: "Oasis" },
          ],
        },
      }).findAll("[data-cy='list-item-content'] > div")[0];
      const sizer = cell.find("[data-cy='list-cell-label-sizer']");
      expect(sizer.text()).toBe("metadata.labels.main-type");
      expect(sizer.attributes("aria-hidden")).toBe("true");
      expect(sizer.classes()).toEqual(expect.arrayContaining(["h-0", "overflow-hidden", "text-label", "font-bold"]));
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
    const fieldsOf = (wrapper: ReturnType<typeof card>) =>
      wrapper.findAll('[data-cy="list-item-content"] > div:not([data-cy="grid-card-actions"])');

    it("fills its grid cell so cards in a row share a height", () => {
      const classes = card().find('[data-cy="list-item"]').classes();
      expect(classes).toEqual(expect.arrayContaining(["h-full", "flex-col"]));
      expect(classes).not.toContain("w-(--grid-card-width)");
    });

    it("shows a square media frame with an icon when there is no media", () => {
      const media = card().find('[data-cy="grid-card-media"]');
      expect(media.classes()).toEqual(
        expect.arrayContaining(["aspect-square", "bg-surface-muted"]),
      );
      expect(media.text()).not.toContain("library.no-media");
    });

    it("crops the thumbnail to fill the square frame", () => {
      const viewer = card({ media: "file.jpg" }).findComponent({
        name: "ImageViewer",
      });
      expect(viewer.props("widthClass")).toContain("object-cover");
    });

    it("shows every field, with visible labels except on the title", () => {
      const wrapper = card({
        teaserMetadata: [
          { key: "title", value: "A title" },
          { key: "type", value: "photo" },
          { key: "status", value: { formatter: "pill" } },
          { key: "credit", value: "Someone" },
        ],
      });
      const fields = fieldsOf(wrapper);
      expect(fields.map((field) => field.classes().includes("hidden"))).toEqual(
        [false, false, false, false],
      );
      expect(fields[0].classes()).toContain(
        "[&_[data-cy=metadata-label]]:sr-only",
      );
      expect(fields[1].classes()).not.toContain(
        "[&_[data-cy=metadata-label]]:sr-only",
      );
    });

    it("stacks each label above its value", () => {
      const wrapper = card({
        teaserMetadata: [
          { key: "title", value: "A title" },
          { key: "type", value: "Book" },
        ],
      });
      expect(
        wrapper.find('[data-cy="list-item-content"]').classes(),
      ).toContain("grid-cols-[minmax(0,1fr)_auto]");
      expect(fieldsOf(wrapper)[1].classes()).toEqual(
        expect.arrayContaining([
          "col-span-2",
          "flex",
          "flex-col",
          "min-w-0",
          // a pill in a narrow card must not break mid-word
          "whitespace-nowrap",
        ]),
      );
      expect(fieldsOf(wrapper)[1].classes().join(" ")).not.toMatch(
        /metadata-label\]\]:(text-|font-)/,
      );
    });

    it("keeps only the title when compact", () => {
      const fields = fieldsOf(
        card({
          compact: true,
          teaserMetadata: [
            { key: "title", value: "A title" },
            { key: "type", value: "Book" },
          ],
        }),
      );
      expect(fields.map((field) => field.classes().includes("hidden"))).toEqual(
        [false, true],
      );
    });

    it("shows the first field as a two-line title in link ink", () => {
      const fields = fieldsOf(
        card({
          teaserMetadata: [
            { key: "title", value: "A title" },
            { key: "type", value: "Book" },
          ],
        }),
      );
      expect(fields[0].classes()).toEqual(
        expect.arrayContaining([
          "row-start-1",
          "line-clamp-2",
          "font-bold",
          "text-heading",
          "text-text-link",
        ]),
      );
    });

    it("drops the title underline on hover", () => {
      const [title] = fieldsOf(
        card({ teaserMetadata: [{ key: "title", value: "A title" }] }),
      );
      expect(title.classes()).toEqual(
        expect.arrayContaining([
          "hover:no-underline",
          "hover:[&_[data-cy=metadata-value]]:no-underline",
        ]),
      );
    });

    it("underlines the title, dashed, but not a leading pill", () => {
      const titled = fieldsOf(
        card({ teaserMetadata: [{ key: "title", value: "A title" }] }),
      );
      expect(titled[0].classes()).toEqual(
        expect.arrayContaining([
          "[&_[data-cy=metadata-value]]:underline",
          "[&_[data-cy=metadata-value]]:decoration-dashed",
        ]),
      );
      const pill = fieldsOf(
        card({
          teaserMetadata: [
            { key: "status", value: { formatter: "pill", label: "Open" } },
          ],
        }),
      );
      expect(pill[0].classes()).not.toContain(
        "[&_[data-cy=metadata-value]]:underline",
      );
    });

    it("links the title to the detail page", () => {
      const link = card({
        titleLink: "/asset/card-1",
        teaserMetadata: [{ key: "title", value: "A title" }],
      }).find('[data-cy="grid-card-title-link"]');
      expect(link.exists()).toBe(true);
      expect(link.attributes("to")).toBe("/asset/card-1");
    });

    it("puts the checkbox on the media and the eye and menu beside the title, with no footer", () => {
      const wrapper = card({
        hasSelection: true,
        previewComponentFeatureEnabled: true,
        teaserMetadata: [{ key: "title", value: "A title" }],
      });
      const checkbox = wrapper
        .find('[data-cy="grid-card-media"]')
        .findComponent(BaseInputCheckbox);
      expect(checkbox.exists()).toBe(true);
      expect(checkbox.props("label")).toBeFalsy();
      expect(checkbox.props("ariaLabel")).toBeTruthy();
      const actions = wrapper.find('[data-cy="grid-card-actions"]');
      expect(actions.classes()).toEqual(
        expect.arrayContaining(["col-start-2", "row-start-1"]),
      );
      expect(actions.findComponent({ name: "PreviewToggle" }).exists()).toBe(
        true,
      );
      expect(actions.findComponent({ name: "EntityButtons" }).exists()).toBe(
        true,
      );
      expect(wrapper.find('[data-cy="grid-card-footer"]').exists()).toBe(false);
    });

    it("borders the card in accent while its preview is open", () => {
      const classes = card({
        previewComponentListItemsCoverage: "OneListItem",
        previewComponentCurrentActive: true,
      })
        .find('[data-cy="list-item"]')
        .classes();
      expect(classes).toContain("border-accent");
      expect(classes).not.toContain("border-border-subtle");
      expect(classes).not.toContain("ring-1");
      expect(classes).not.toContain("border-l-accent");
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

    it("keeps the eye and the ⋮ together when they wrap, eye first", () => {
      const actions = shallowMount(ListItem, {
        props: {
          ...defaultProps,
          itemId: "row-1",
          viewMode: "list" as const,
          baseLibraryMode: "normalBaseLibrary" as any,
          previewComponentFeatureEnabled: true,
        },
      }).find('[data-cy="list-item-actions"]');

      expect(actions.classes()).toContain("shrink-0");
      const children = actions.findAll(":scope > *");
      expect(children[0].attributes("data-preview-for")).toBe("row-1");
      expect(children.at(-1)!.html()).toContain("entity-buttons");
    });

    it("right-aligns the actions when they wrap", () => {
      expect(
        listRow().find('[data-cy="list-item-actions"]').classes(),
      ).toContain("ml-auto");
    });
  });
});
