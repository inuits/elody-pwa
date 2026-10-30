import { describe, it, expect, vi } from "vitest";
import { flushPromises, shallowMount } from "@vue/test-utils";
import { ref } from "vue";
import EntityColumn from "@/components/EntityColumn.vue";

vi.mock("@/composables/useResizeHelper", () => ({
  useColumnResizeHelper: () => ({
    setInitialColumns: vi.fn(),
    currentColumnConfig: ref({
      "entity-1": [
        { size: "sixty", elements: {} },
        { size: "forty", elements: {} },
      ],
    }),
    setColumnSizes: vi.fn(),
    resetToDefaultSizes: vi.fn(),
  }),
  useEntityElementCollapseHelper: () => ({ toggleElementCollapse: vi.fn() }),
}));
vi.mock("@/composables/useEdit", () => ({
  useEditMode: () => ({ isEdit: false }),
}));
vi.mock("vue-router", () => ({ onBeforeRouteUpdate: vi.fn() }));
vi.mock("vue-i18n", () => ({ useI18n: () => ({ locale: ref("en") }) }));
vi.mock("@/helpers", () => ({
  convertSizeToTailwind: (size: string) => `w-${size}`,
  determineDefaultIntialValues: () => ({}),
  findPanelMetadata: () => [],
  findWysiwygElement: () => [],
}));
vi.mock("@/components/EntityForm.vue", () => ({
  default: { name: "EntityForm", template: "<div><slot /></div>" },
}));
vi.mock("@/components/entityElements/EntityElement.vue", () => ({
  default: { name: "EntityElement", template: "<div />" },
}));

const mountColumns = async () => {
  const wrapper = shallowMount(EntityColumn, {
    props: {
      entity: { id: "entity-1", intialValues: {}, relationValues: {} } as any,
      columnList: {} as any,
      identifiers: [],
      entityType: "work" as any,
    },
    global: {
      stubs: {
        EntityForm: { template: "<div><slot /></div>" },
      },
    },
  });
  await flushPromises();
  return wrapper;
};

// ui_kits DetailScreen: the page padding around the columns, the panel
// gutter between them (was 20px per column: 40px between, 20px at the edges)
describe("EntityColumn page layout", () => {
  it("pads the detail page with the page padding and spaces columns by the panel gutter", async () => {
    const wrapper = await mountColumns();
    const page = wrapper.find(".w-sixty").element.parentElement!;
    expect(page.classList).toContain("p-(--page-pad)");
    expect(page.classList).toContain("gap-(--gutter-panels)");
    expect(page.classList).not.toContain("mt-5");
  });

  it("lets columns shrink into the gutter instead of padding each one", async () => {
    const column = (await mountColumns()).find(".w-sixty");
    expect(column.classes()).toContain("min-w-0");
    expect(column.classes()).not.toContain("px-5");
  });
});
