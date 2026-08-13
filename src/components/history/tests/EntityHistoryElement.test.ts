import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import EntityHistoryElement from "../EntityHistoryElement.vue";

vi.mock("vue-router", () => ({
  useRoute: () => ({ params: { id: "route-entity-id" } }),
}));

vi.mock("@/components/history/EntityHistoryWindow.vue", () => ({
  default: {
    name: "EntityHistoryWindow",
    props: ["element", "identifiers"],
    template: "<div />",
  },
}));

const windowElement = { __typename: "WindowElement" };

const getWrapper = (entity: Record<string, any>, elements = { panel: windowElement }) =>
  mount(EntityHistoryElement, {
    props: {
      elements,
      entity,
      relationDiffs: [],
      wysiwygDiffs: [],
    },
    global: {
      stubs: { RelationDiffList: true },
    },
  });

describe("EntityHistoryElement", () => {
  it("passes the entity's own intialValues.identifiers through to entity-history-window", () => {
    const wrapper = getWrapper({
      id: "entity-1",
      uuid: "uuid-1",
      intialValues: { identifiers: ["id-a", "id-b"] },
      relationValues: {},
    });

    const windowStub = wrapper.findComponent({ name: "EntityHistoryWindow" });
    expect(windowStub.props("identifiers")).toEqual(["id-a", "id-b"]);
  });

  it("falls back to [uuid, id] when intialValues.identifiers is absent", () => {
    const wrapper = getWrapper({
      id: "entity-2",
      uuid: "uuid-2",
      intialValues: {},
      relationValues: {},
    });

    const windowStub = wrapper.findComponent({ name: "EntityHistoryWindow" });
    expect(windowStub.props("identifiers")).toEqual(["uuid-2", "entity-2"]);
  });

  it("never passes a hardcoded empty identifiers array", () => {
    const wrapper = getWrapper({
      id: "entity-3",
      uuid: "uuid-3",
      intialValues: {},
      relationValues: {},
    });

    const windowStub = wrapper.findComponent({ name: "EntityHistoryWindow" });
    expect(windowStub.props("identifiers")).not.toEqual([]);
  });
});

describe("EntityHistoryElement element ordering", () => {
  const entity = {
    id: "entity-1",
    uuid: "uuid-1",
    intialValues: {},
    relationValues: {},
  };

  it("keys each rendered element by its own name in elements, not by array position", () => {
    const elements = {
      audit: { __typename: "WindowElement", label: "audit" },
      info: { __typename: "WindowElement", label: "info" },
    };

    const wrapper = getWrapper(entity, elements);
    const windows = wrapper.findAllComponents({ name: "EntityHistoryWindow" });

    expect(windows).toHaveLength(2);
    expect(windows[0].props("element").label).toBe("audit");
    expect(windows[1].props("element").label).toBe("info");
  });

  it("keeps rendering the same element at the same position across re-renders, regardless of identity churn", async () => {
    const elements = {
      audit: { __typename: "WindowElement", label: "audit" },
      info: { __typename: "WindowElement", label: "info" },
    };

    const wrapper = getWrapper(entity, elements);

    // Simulate the underlying computed re-evaluating with brand-new object
    // references for the same conceptual elements (exactly what happens when
    // leftVersion/rightVersion recompute) -- order must stay stable because
    // the key is the element's own name, not its position in the object.
    await wrapper.setProps({
      elements: {
        audit: { __typename: "WindowElement", label: "audit" },
        info: { __typename: "WindowElement", label: "info" },
      },
    });

    const windows = wrapper.findAllComponents({ name: "EntityHistoryWindow" });
    expect(windows[0].props("element").label).toBe("audit");
    expect(windows[1].props("element").label).toBe("info");
  });
});
