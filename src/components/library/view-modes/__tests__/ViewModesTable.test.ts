import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import ViewModesTable from "../ViewModesTable.vue";
import { type Entity } from "@/generated-types/queries";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({ openModal: vi.fn(), changeCloseConfirmation: vi.fn() }),
}));

vi.mock("@/composables/useEntityPageConfig", async () => {
  const { ref } = await import("vue");
  return { useEntityPageConfig: () => ({ seenTracking: ref(undefined) }) };
});

vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({ findRelation: () => "no-relation-found" }),
}));

vi.mock(
  "@/components/library/view-modes/composables/useEntityListHelpers",
  () => ({
    useEntityListHelpers: () => ({
      getLinkSettings: () => ({ tag: "div", path: undefined }),
      isEntityDisabled: () => false,
      entityWrapperHandler: vi.fn(),
      getButtons: () => undefined,
    }),
  }),
);

vi.mock("@/helpers", () => ({
  formatTeaserMetadata: (teaserMetadata: any, intialValues: any) =>
    Object.keys(teaserMetadata ?? {})
      .filter((key) => key !== "__typename")
      .map((key) => ({
        ...teaserMetadata[key],
        key,
        value: intialValues?.[key],
      })),
  getMappedSlug: (entity: any) => entity.type,
}));

const makeEntity = (id: string): Entity =>
  ({
    id,
    uuid: id,
    type: "user",
    teaserMetadata: { first_name: { label: "First name", key: "first_name" } },
    intialValues: { id, first_name: id },
    relationValues: {},
  }) as unknown as Entity;

const checkboxStub = {
  name: "BaseInputCheckbox",
  props: ["modelValue", "ariaLabel"],
  emits: ["update:modelValue"],
  template: "<input type='checkbox' data-cy='select-page-stub' />",
};

const mountTable = (props: Record<string, unknown> = {}) =>
  mount(ViewModesTable, {
    props: {
      entities: [makeEntity("u1"), makeEntity("u2")],
      entitiesLoading: false,
      bulkOperationsContext: undefined,
      listItemRouteName: "SingleEntity",
      entityType: "user",
      configPerViewMode: {},
      ...props,
    } as any,
    global: {
      stubs: {
        TableViewRow: true,
        PreviewWrapper: true,
        PreviewHost: true,
        BaseButtonNew: true,
        BaseInputCheckbox: checkboxStub,
      },
    },
  });

const selectPage = (wrapper: ReturnType<typeof mountTable>) =>
  wrapper
    .find('[data-cy="view-modes-table-header-leading"]')
    .findComponent({ name: "BaseInputCheckbox" });

describe("ViewModesTable header", () => {
  it("selects the page from the leading column", async () => {
    const wrapper = mountTable({ pageIsSelected: true });
    expect(selectPage(wrapper).exists()).toBe(true);
    expect(selectPage(wrapper).props("modelValue")).toBe(true);
    expect(selectPage(wrapper).props("ariaLabel")).toBe(
      "bulk-operations.select-page",
    );
    selectPage(wrapper).vm.$emit("update:modelValue", false);
    expect(wrapper.emitted("togglePageSelection")).toEqual([[false]]);
  });

  it("has no select-page box when selection is off", () => {
    const wrapper = mountTable({ enableSelection: false });
    expect(
      wrapper.findComponent({ name: "BaseInputCheckbox" }).exists(),
    ).toBe(false);
  });
});
