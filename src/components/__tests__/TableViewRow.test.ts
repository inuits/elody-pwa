import TableViewRow from "../library/view-modes/TableViewRow.vue";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import type { SeenTracking } from "@/types/contextMenuRouteConfig";

const mockSeenState = vi.hoisted(() => ({
  tracking: undefined as unknown,
  isSeen: vi.fn<(id: string) => boolean>(() => false),
  isNew: vi.fn<(id: string, values?: Record<string, unknown>) => boolean>(
    () => false,
  ),
}));

vi.mock("@/composables/useSeenItems", () => ({
  useSeenState: (tracking: unknown) => {
    mockSeenState.tracking = tracking;
    return mockSeenState;
  },
}));

const mockEntityPageConfig = vi.hoisted(() => ({
  seenTracking: { value: undefined as SeenTracking | undefined },
}));

vi.mock("@/composables/useEntityPageConfig", () => ({
  useEntityPageConfig: () => mockEntityPageConfig,
}));

vi.mock("@/main", () => ({
  auth: { isAuthenticated: { value: true } },
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const props = {
  itemId: "item",
  intialValues: { last_activity_at: "2026-10-09T10:00:00Z" } as any,
  relation: "no-relation-found" as const,
  bulkOperationsContext: undefined,
  hasSelection: false,
  hasThumbnail: false,
  previewComponentEnabled: false,
  previewComponentCurrentActive: false,
  previewComponentFeatureEnabled: false,
};

const row = (wrapper: ReturnType<typeof shallowMount>) =>
  wrapper.find("[data-cy='table-row']");

describe("TableViewRow", () => {
  beforeEach(() => {
    mockSeenState.isSeen.mockReset().mockReturnValue(false);
    mockSeenState.isNew.mockReset().mockReturnValue(false);
  });

  it("uses the seen tracking of the current route", () => {
    shallowMount(TableViewRow, { props });

    expect(mockSeenState.tracking).toBe(mockEntityPageConfig.seenTracking);
  });

  it("shows a seen row's title in secondary ink without greying the row", () => {
    mockSeenState.isSeen.mockReturnValue(true);

    const wrapper = shallowMount(TableViewRow, {
      props: {
        ...props,
        teaserMetadata: [
          { key: "title", value: "Seen" },
          { key: "type", value: "Book" },
        ] as any,
      },
    });
    const columns = wrapper.findAll(".col-primary, .col-secondary");

    expect(columns[0].classes()).toContain("text-text-secondary");
    expect(columns[1].classes()).not.toContain("text-text-secondary");
    expect(row(wrapper).classes()).not.toContain("grayscale");
    expect(mockSeenState.isSeen).toHaveBeenCalledWith("item");
  });

  it("highlights a row with new activity", () => {
    mockSeenState.isNew.mockReturnValue(true);

    const wrapper = shallowMount(TableViewRow, { props });

    expect(row(wrapper).classes()).toContain("font-semibold");
    expect(row(wrapper).classes()).not.toContain("grayscale");
    expect(wrapper.find("[data-cy='new-indicator']").exists()).toBe(true);
    expect(mockSeenState.isNew).toHaveBeenCalledWith("item", {
      last_activity_at: "2026-10-09T10:00:00Z",
    });
  });

  it("does not highlight a row without new activity", () => {
    const wrapper = shallowMount(TableViewRow, { props });

    expect(row(wrapper).classes()).not.toContain("font-semibold");
    expect(wrapper.find("[data-cy='new-indicator']").exists()).toBe(false);
  });

  it("centers the new indicator in the selection column without a checkbox", () => {
    mockSeenState.isNew.mockReturnValue(true);

    const wrapper = shallowMount(TableViewRow, { props });

    expect(wrapper.find("[data-cy='new-indicator']").classes()).toContain(
      "left-1/2",
    );
  });

  it("keeps the new indicator left of the checkbox when rows are selectable", () => {
    mockSeenState.isNew.mockReturnValue(true);

    const wrapper = shallowMount(TableViewRow, {
      props: { ...props, hasSelection: true },
    });

    expect(wrapper.find("[data-cy='new-indicator']").classes()).toContain(
      "-left-1",
    );
    expect(wrapper.find("[data-cy='new-indicator']").classes()).not.toContain(
      "left-1/2",
    );
  });

  it("toggles the preview from a real eye button", () => {
    const wrapper = shallowMount(TableViewRow, {
      props: {
        ...props,
        baseLibraryMode: "normalBaseLibrary" as any,
        previewComponentFeatureEnabled: true,
      },
    });

    wrapper.findComponent({ name: "PreviewToggle" }).vm.$emit("toggle");

    expect(wrapper.emitted("togglePreviewComponent")?.[0]).toEqual(["item"]);
  });

  describe("row states", () => {
    const rowProps = {
      ...props,
      baseLibraryMode: "normalBaseLibrary" as any,
      hasSelection: true,
      previewComponentFeatureEnabled: true,
      previewComponentListItemsCoverage: "OneListItem" as any,
    };

    it("fills on hover", () => {
      const wrapper = shallowMount(TableViewRow, { props: rowProps });
      expect(row(wrapper).classes()).toContain("hover:bg-surface-row-hover");
    });

    it("washes a selected row with an accent row shadow", async () => {
      const wrapper = shallowMount(TableViewRow, { props: rowProps });

      await wrapper
        .findComponent({ name: "BaseInputCheckbox" })
        .vm.$emit("update:modelValue", true);

      expect(row(wrapper).classes()).toEqual(
        expect.arrayContaining(["bg-accent-wash", "shadow-accent-row"]),
      );
    });

    it("marks the previewed row with an accent left border and no wash", () => {
      const wrapper = shallowMount(TableViewRow, {
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
      const lastPreviewed = shallowMount(TableViewRow, {
        props: { ...rowProps, previewComponentCurrentActive: true },
      });
      const open = shallowMount(TableViewRow, {
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
});
