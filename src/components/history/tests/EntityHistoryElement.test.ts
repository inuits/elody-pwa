import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import EntityHistoryElement from "../EntityHistoryElement.vue";

const windowElement = { __typename: "WindowElement" };

const getWrapper = (entity: Record<string, any>) =>
  mount(EntityHistoryElement, {
    props: {
      elements: { panel: windowElement },
      entity,
      relationDiffs: [],
      wysiwygDiffs: [],
    },
    global: {
      stubs: { EntityHistoryWindow: true, RelationDiffList: true },
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
