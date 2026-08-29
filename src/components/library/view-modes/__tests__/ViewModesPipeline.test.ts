import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import ViewModesPipeline from "../ViewModesPipeline.vue";
import ListItem from "@/components/ListItem.vue";
import type { Entity } from "@/generated-types/queries";

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockOpenModal = vi.fn();
const mockEntityWrapperHandler = vi.fn();
let relationByEntityId: Record<string, any> = {};

vi.mock("@/components/ListItem.vue", () => ({
  default: {
    name: "ListItem",
    props: ["itemId", "viewMode", "teaserMetadata"],
    template: "<li class='list-item-stub' />",
  },
}));

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({ openModal: mockOpenModal }),
}));

vi.mock("@/composables/useFormHelper", () => ({
  useFormHelper: () => ({
    findRelation: (entityId: string) =>
      relationByEntityId[entityId] ?? "no-relation-found",
  }),
}));

vi.mock(
  "@/components/library/view-modes/composables/useEntityListHelpers",
  () => ({
    useEntityListHelpers: () => ({
      getLinkSettings: () => ({ tag: "div", path: undefined }),
      isEntityDisabled: () => false,
      entityWrapperHandler: mockEntityWrapperHandler,
      getContextMenu: () => undefined,
    }),
  }),
);

vi.mock("@/helpers", () => ({
  enrichProcessorConfig: (
    teaserMetadata: any,
    intialValues: any,
  ): { teaserMetadata: any; intialValues: any } => ({
    teaserMetadata,
    intialValues,
  }),
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const makeEntity = (
  id: string,
  intialValues: Record<string, unknown> = {},
): Entity =>
  ({
    id,
    uuid: id,
    type: "githubProcessor",
    teaserMetadata: { name: { label: "Name", key: "name" } },
    intialValues: { id, name: id, ...intialValues },
    relationValues: {},
  }) as unknown as Entity;

const mountPipeline = (
  entities: Entity[],
  overrides: Record<string, unknown> = {},
) =>
  mount(ViewModesPipeline, {
    props: {
      entities,
      entitiesLoading: false,
      bulkOperationsContext: undefined,
      listItemRouteName: "SingleEntity",
      parentEntityIdentifiers: ["pipeline-1"],
      relationType: "hasProcessor",
      enableSelection: true,
      ...overrides,
    },
  });

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("ViewModesPipeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    relationByEntityId = {};
  });

  it("renders one ListItem per entity, in pipeline view mode", () => {
    const wrapper = mountPipeline([makeEntity("a"), makeEntity("b")]);

    const items = wrapper.findAllComponents(ListItem);
    expect(items).toHaveLength(2);
    items.forEach((item) => expect(item.props("viewMode")).toBe("pipeline"));
  });

  it("does not navigate on a card click: the corner actions menu is the interaction", async () => {
    const wrapper = mountPipeline([makeEntity("a")], {
      openEntityInDetailModal: true,
    });

    await wrapper.find("[data-pipeline-node]").trigger("click");

    expect(mockOpenModal).not.toHaveBeenCalled();
    expect(mockEntityWrapperHandler).not.toHaveBeenCalled();
    expect(wrapper.find("[data-pipeline-node] a").exists()).toBe(false);
  });

  it("has no drag affordances on cards", () => {
    const wrapper = mountPipeline([makeEntity("a"), makeEntity("b")]);

    expect(wrapper.findAll("[draggable]")).toHaveLength(0);
    expect(wrapper.find("[data-pipeline-node]").attributes("draggable")).toBe(
      undefined,
    );
  });

  it("draws an edge from the relation's connection metadata", () => {
    relationByEntityId["consumer"] = {
      idx: 0,
      relation: {
        metadata: [
          { key: "connections.in.from", value: "producer|out" },
          { key: "connections.in.status", value: "valid" },
        ],
      },
    };
    const wrapper = mountPipeline([
      makeEntity("producer", { "contracts.produces": "Measurements in cm" }),
      makeEntity("consumer", { "contracts.consumes": "Measurements in cm" }),
    ]);

    expect(wrapper.find('[data-cy="pipeline-edge-valid"]').exists()).toBe(true);
  });

  it("renders a mismatch connection as a dashed edge with its badge", () => {
    relationByEntityId["consumer"] = {
      idx: 0,
      relation: {
        metadata: [
          { key: "connections.in.from", value: "producer|out" },
          { key: "connections.in.status", value: "mismatch" },
          { key: "connections.in.badge", value: "mm ≠ cm" },
        ],
      },
    };
    const wrapper = mountPipeline([
      makeEntity("producer", { "contracts.produces": "Measurements in mm" }),
      makeEntity("consumer", { "contracts.consumes": "Measurements in cm" }),
    ]);

    const edge = wrapper.find('[data-cy="pipeline-edge-mismatch"]');
    expect(edge.exists()).toBe(true);
    expect(edge.attributes("stroke-dasharray")).toBe("4 4");
    expect(wrapper.find('[data-cy="pipeline-mismatch-badge"]').text()).toBe(
      "mm ≠ cm",
    );
  });

  it("shows the empty ghost card when there are no entities", () => {
    const wrapper = mountPipeline([]);

    const ghost = wrapper.find('[data-cy="pipeline-ghost-node"]');
    expect(ghost.exists()).toBe(true);
    expect(ghost.text()).toContain("pipeline.empty-title");
    expect(wrapper.findAllComponents(ListItem)).toHaveLength(0);
  });

  it("hands the ghost card's add action to the existing add flow", async () => {
    const wrapper = mountPipeline([]);

    await wrapper.find('[data-cy="pipeline-add-component"]').trigger("click");

    expect(wrapper.emitted("addComponent")).toHaveLength(1);
  });

  it("offers an add-consumer action on an output port that knows its shape", async () => {
    const wrapper = mountPipeline([
      makeEntity("producer", {
        "contracts.produces": "Error alert",
        "contracts.produces.iri": "http://x/shapes/ErrorShape",
      }),
    ]);

    const portButton = wrapper.find('button[data-cy="pipeline-port-out-out"]');
    expect(portButton.exists()).toBe(true);

    await portButton.trigger("click");

    const emitted = wrapper.emitted("addConsumer");
    expect(emitted).toHaveLength(1);
    expect((emitted![0][0] as any).shapeIris).toEqual([
      "http://x/shapes/ErrorShape",
    ]);
  });

  it("keeps a plain dot on an output port without a known shape", () => {
    relationByEntityId["consumer"] = {
      idx: 0,
      relation: {
        metadata: [{ key: "connections.in.from", value: "producer|out" }],
      },
    };
    // the producer feeds someone, so it has an output port — but no shape IRI
    const wrapper = mountPipeline([
      makeEntity("producer"),
      makeEntity("consumer"),
    ]);

    expect(wrapper.find('button[data-cy="pipeline-port-out-out"]').exists()).toBe(
      false,
    );
    expect(wrapper.find('span[data-cy="pipeline-port-out-out"]').exists()).toBe(
      true,
    );
  });

  it("shows the whole chain: unpaged fetch on mount, restored on unmount", () => {
    const setPaginationLimit = vi.fn();
    const wrapper = mountPipeline([makeEntity("a")], { setPaginationLimit });

    expect(setPaginationLimit).toHaveBeenCalledWith(1000, true);

    wrapper.unmount();
    expect(setPaginationLimit).toHaveBeenCalledWith(20, true);
  });
});
