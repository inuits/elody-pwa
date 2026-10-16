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
