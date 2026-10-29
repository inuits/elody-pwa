import { describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));
vi.mock("@/components/entityElements/EntityElementList.vue", () => ({
  default: {},
}));
vi.mock("@/components/metadata/MetadataWrapper.vue", () => ({ default: {} }));
vi.mock("@/components/EntityElementCoordinateEdit.vue", () => ({
  default: {},
}));
vi.mock("@/components/entityElements/WYSIWYG/EntityElementWYSIWYG.vue", () => ({
  default: {},
}));
vi.mock("@/components/EntityElementRelation.vue", () => ({ default: {} }));
vi.mock("@/components/metadata/MultilingualWrapper.vue", () => ({
  default: {},
}));

import WindowPanelContent from "../WindowPanelContent.vue";

// A repeatable panel with more than one row.
const mountRow = (isEdit: boolean) =>
  shallowMount(WindowPanelContent, {
    props: {
      panelType: "metadata",
      relationArray: [],
      metadatafields: [],
      canBeMultipleColumns: true,
      formId: "E-1",
      isEdit,
      editState: {},
      identifiers: [],
      parentIsListItem: false,
      repeatablePanelConfig: {
        isRepeatable: true,
        index: 0,
        field: undefined,
        repeatableFieldsHelper: {
          repetitionDeleteIsAvailable: { value: true },
        },
      },
    } as any,
    global: { provide: { config: { customization: {} } } },
  });

describe("WindowPanelContent — a row of a repeatable panel", () => {
  it("keeps its fields side by side outside page edit mode", () => {
    expect(mountRow(false).classes()).not.toContain("flex");
  });

  it("makes room for its delete button in page edit mode", () => {
    expect(mountRow(true).classes()).toContain("flex");
  });

  it("names its icon-only delete button", () => {
    expect(
      mountRow(true).findComponent({ name: "BaseButtonNew" }).props("ariaLabel"),
    ).toBe("inline-edit.remove-row");
  });
});

describe("WindowPanelContent — compact preview", () => {
  const mountFields = (compact: boolean) =>
    shallowMount(WindowPanelContent, {
      props: {
        panelType: "metadata",
        relationArray: [],
        metadatafields: [{ key: "type", __typename: "MetadataField" }],
        canBeMultipleColumns: true,
        formId: "E-1",
        isEdit: false,
        editState: {},
        identifiers: [],
        parentIsListItem: false,
      } as any,
      global: {
        provide: { config: { customization: {} }, CompactPreview: compact },
      },
    });

  it("lays its fields out as one label/value grid", () => {
    const grid = mountFields(true).find('[data-cy="preview-field-grid"]');

    expect(grid.exists()).toBe(true);
    expect(grid.classes()).not.toContain(
      "grid-cols-[repeat(auto-fit,_minmax(250px,_1fr))]",
    );
  });

  it("keeps the multi-column field layout outside a preview", () => {
    expect(
      mountFields(false).find('[data-cy="preview-field-grid"]').exists(),
    ).toBe(false);
  });
});
