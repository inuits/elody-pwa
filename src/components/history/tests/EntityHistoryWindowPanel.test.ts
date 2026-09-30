import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import EntityHistoryWindowPanel from "../EntityHistoryWindowPanel.vue";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (k: string) => k }) }));
vi.mock("@/composables/useEdit", () => ({
  useEditMode: () => ({ isEdit: false, showErrors: false }),
}));
vi.mock("@/composables/useRepeatableFields", () => ({
  useRepeatableFields: () => ({
    repeatAmount: { value: 1 },
    fields: { value: [] },
    init: vi.fn(),
  }),
}));
vi.mock("@/composables/useWindowOrPanelStatus", () => ({
  useWindowOrPanelStatus: () => ({
    getStatusMetadata: vi.fn(),
    registerEditableKey: vi.fn(),
  }),
}));
vi.mock("@/helpers", () => ({ getMetadataFields: () => [] }));

const mountPanel = (isCollapsed: boolean) =>
  mount(EntityHistoryWindowPanel, {
    props: {
      panel: {
        __typename: "WindowElementPanel",
        panelType: "metadata",
        isCollapsed,
        panelHeaderContent: { label: "Annotaties" },
      } as any,
      identifiers: [],
      isEdit: false,
      formId: "1",
      wysiwygDiffs: [],
      relationDiffs: [],
    },
    global: {
      stubs: {
        EntityHistoryWindowPanelContent: {
          name: "EntityHistoryWindowPanelContent",
          template: '<div data-test="panel-content" />',
        },
        MetadataWrapper: true,
        BaseButtonNew: true,
        unicon: true,
      },
    },
  });

describe("EntityHistoryWindowPanel", () => {
  it("starts expanded even when the panel is configured as collapsed, so every change is visible at once", () => {
    const wrapper = mountPanel(true);

    expect(wrapper.find('[data-test="panel-content"]').isVisible()).toBe(true);
  });

  it("can still be collapsed by clicking its header", async () => {
    const wrapper = mountPanel(true);

    await wrapper.find(".cursor-pointer").trigger("click");

    expect(wrapper.find('[data-test="panel-content"]').isVisible()).toBe(false);
  });
});
