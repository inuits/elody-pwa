import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { ref } from "vue";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));
vi.mock("@/composables/useEdit", () => ({
  useEditMode: () => ({ isEdit: false, showErrors: false }),
}));
vi.mock("@/composables/useRepeatableFields", () => ({
  useRepeatableFields: () => ({
    repeatAmount: ref(1),
    fields: ref([]),
    init: vi.fn(),
    increaseFieldRepeatAmount: vi.fn(),
    decreaseFieldRepeatAmount: vi.fn(),
  }),
}));
vi.mock("@/composables/useWindowOrPanelStatus", () => ({
  useWindowOrPanelStatus: () => ({
    getStatusMetadata: () => ({ key: "status" }),
    registerEditableKey: vi.fn(),
  }),
}));
vi.mock("@/components/library/useBaseLibrary", () => ({
  getLibraryDataValue: () => undefined,
}));
vi.mock("@/helpers", () => ({ getMetadataFields: () => [] }));
vi.mock("@/types", () => ({
  Unicons: { CompressAlt: { name: "compress" }, ExpandAlt: { name: "expand" } },
}));

import EntityElementWindowPanel from "../EntityElementWindowPanel.vue";

const mountPanel = () =>
  mount(EntityElementWindowPanel, {
    props: {
      panel: {
        panelType: "metadata",
        isCollapsed: false,
        panelHeaderContent: { label: "Status", panelStatus: { key: "status" } },
      } as any,
      identifiers: [],
      isEdit: false,
      formId: "E-1",
    },
    global: {
      stubs: {
        unicon: true,
        WindowPanelContent: true,
        BaseButtonNew: true,
        MetadataWrapper: {
          template:
            "<div data-cy='panel-status'><span data-cy='status-value'>Draft</span></div>",
        },
      },
    },
  });

const isCollapsed = (wrapper: ReturnType<typeof mountPanel>) =>
  wrapper.find(".grid.transition-\\[grid-template-rows\\]").classes().includes("grid-rows-[0fr]");

describe("EntityElementWindowPanel header", () => {
  it("collapses the panel from a click on the header", async () => {
    const wrapper = mountPanel();
    await wrapper.find("h2").trigger("click");
    expect(isCollapsed(wrapper)).toBe(true);
  });

  it("leaves the panel as it is when the status field in the header is clicked (to edit it)", async () => {
    const wrapper = mountPanel();
    await wrapper.find('[data-cy="status-value"]').trigger("click");
    expect(isCollapsed(wrapper)).toBe(false);
  });
});
