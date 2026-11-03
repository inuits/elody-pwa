import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import { describe, it, expect, vi, beforeEach } from "vitest";
import EntityElement from "../EntityElement.vue";
import { Entitytyping } from "@/generated-types/queries";
import { useUsageSurface } from "@/analytics/usageSurface";

vi.mock("@/composables/useEdit", () => ({
  useEditMode: () => ({ isEdit: { value: false } }),
}));

vi.mock("@/composables/useStateManagement", () => ({
  useStateManagement: () => ({
    getStateForRoute: vi.fn().mockReturnValue(null),
    updateStateForRoute: vi.fn(),
  }),
}));

vi.mock("vue-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue-router")>();
  return {
    ...actual,
    useRoute: () => ({ name: "test-route", params: {} }),
    useRouter: () => ({}),
  };
});

const listStub = defineComponent({
  name: "EntityElementList",
  render: () => h("div", { "data-test": "entity-element-list-stub" }),
});

const noopStub = defineComponent({ render: () => h("span") });

const STUBS = {
  EntityElementList: listStub,
  EntityElementMedia: noopStub,
  EntityElementSingleMedia: noopStub,
  EntityElementWindow: noopStub,
  EntityElementGraph: noopStub,
  EntityElementManifestViewer: noopStub,
  EntityElementMarkdownViewer: noopStub,
  EntityElementMapViewer: noopStub,
  EntityElementWYSIWYG: noopStub,
  EntityElementHierarchyListViewer: noopStub,
};

const makeListElement = (overrides: object = {}) => ({
  __typename: "EntityListElement",
  isCollapsed: false,
  ...overrides,
});

const makeElements = (element: object) => ({
  __typename: "EntityViewElements",
  testList: element,
});

const getProps = (overrides: object = {}) => ({
  elements: makeElements(makeListElement()),
  identifiers: [],
  id: "test-id",
  entityType: "BaseEntity" as Entitytyping,
  ...overrides,
});

const mountComponent = (props: object) =>
  mount(EntityElement, { props, global: { stubs: STUBS } });

describe("EntityElement — usage surface", () => {
  it("tells what is inside an element that element's alias", () => {
    let read: () => string | undefined = () => "not read";
    const readingList = defineComponent({
      name: "EntityElementList",
      setup() {
        read = useUsageSurface();
        return () => h("div");
      },
    });
    mount(EntityElement, {
      props: getProps({
        elements: {
          __typename: "EntityViewElements",
          completenessOverview: makeListElement(),
        },
      }),
      global: { stubs: { ...STUBS, EntityElementList: readingList } },
    });
    expect(read()).toBe("completenessOverview");
  });
});

describe("EntityElement — displayCondition", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the list element when no displayCondition is configured", () => {
    const wrapper = mountComponent(getProps());

    expect(
      wrapper.find('[data-test="entity-element-list-stub"]').exists(),
    ).toBe(true);
  });

  it("shows the list element when displayCondition key and value match entity metadata", () => {
    const wrapper = mountComponent(
      getProps({
        elements: makeElements(
          makeListElement({ displayCondition: { key: "type", value: "book" } }),
        ),
        entityMetadata: { type: "book" },
      }),
    );

    expect(
      wrapper.find('[data-test="entity-element-list-stub"]').exists(),
    ).toBe(true);
  });

  it("hides the list element when displayCondition value does not match entity metadata", () => {
    const wrapper = mountComponent(
      getProps({
        elements: makeElements(
          makeListElement({ displayCondition: { key: "type", value: "book" } }),
        ),
        entityMetadata: { type: "magazine" },
      }),
    );

    expect(
      wrapper.find('[data-test="entity-element-list-stub"]').exists(),
    ).toBe(false);
  });

  it("hides the list element when the metadata key is absent from entity metadata", () => {
    const wrapper = mountComponent(
      getProps({
        elements: makeElements(
          makeListElement({ displayCondition: { key: "type", value: "book" } }),
        ),
        entityMetadata: { title: "Some title" },
      }),
    );

    expect(
      wrapper.find('[data-test="entity-element-list-stub"]').exists(),
    ).toBe(false);
  });

  it("shows the list element when displayCondition is null", () => {
    const wrapper = mountComponent(
      getProps({
        elements: makeElements(makeListElement({ displayCondition: null })),
        entityMetadata: { type: "book" },
      }),
    );

    expect(
      wrapper.find('[data-test="entity-element-list-stub"]').exists(),
    ).toBe(true);
  });
});
