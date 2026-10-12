import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import EntityHistoryWindowPanel from "../EntityHistoryWindowPanel.vue";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (k: string) => k }) }));
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
        isCollapsed,
        panelHeaderContent: { label: "Annotaties" },
      } as any,
      identifiers: [],
      formId: "1",
      wysiwygDiffs: [],
      relationDiffs: [],
    },
    global: {
      stubs: {
        EntityHistoryWindowPanelContent: {
          name: "EntityHistoryWindowPanelContent",
          props: ["relationArray"],
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

  it("hands its content only the panel's relations, never one of its config objects", () => {
    const relations = [{ __typename: "PanelRelation", label: "Lewis" }];
    const wrapper = mount(EntityHistoryWindowPanel, {
      props: {
        panel: {
          __typename: "WindowElementPanel",
          isCollapsed: false,
          relations,
          bulkData: [{ key: "codec", value: "h264" }],
          panelHeaderContent: { label: "Relaties" },
          displayCondition: { key: "status" },
        } as any,
        identifiers: [],
        formId: "1",
        wysiwygDiffs: [],
        relationDiffs: [],
      },
      global: {
        stubs: {
          EntityHistoryWindowPanelContent: {
            name: "EntityHistoryWindowPanelContent",
            props: ["relationArray"],
            template: "<div />",
          },
          MetadataWrapper: true,
          unicon: true,
        },
      },
    });

    const relationArray = wrapper
      .findComponent({ name: "EntityHistoryWindowPanelContent" })
      .props("relationArray");
    expect(Array.isArray(relationArray)).toBe(true);
    expect(relationArray).toEqual(relations);
  });
});
