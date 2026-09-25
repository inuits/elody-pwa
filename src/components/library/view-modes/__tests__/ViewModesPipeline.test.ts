import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import ViewModesPipeline from "../ViewModesPipeline.vue";
import ListItem from "@/components/ListItem.vue";
import type { Entity } from "@/generated-types/queries";

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockOpenModal = vi.fn();
const mockEntityWrapperHandler = vi.fn();

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
    findRelation: () => "no-relation-found",
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
  relationValues: Record<string, { key: string }[]> = {},
): Entity =>
  ({
    id,
    uuid: id,
    type: "work",
    teaserMetadata: { title: { label: "Title", key: "title" } },
    intialValues: { id, title: id },
    relationValues,
  }) as unknown as Entity;

const wemiFamily = () => [
  makeEntity("w1"),
  makeEntity("e1", { refWork: [{ key: "w1" }] }),
  makeEntity("m1", { refExpressions: [{ key: "e1" }] }),
];

const WEMI_CONFIG = [
  { key: "edgeRelations", value: ["refWork", "refExpressions"] },
];

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
      parentEntityIdentifiers: ["parent-1"],
      enableSelection: true,
      ...overrides,
    },
  });

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("ViewModesPipeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders one ListItem per entity, in pipeline view mode", () => {
    const wrapper = mountPipeline([makeEntity("a"), makeEntity("b")]);

    const items = wrapper.findAllComponents(ListItem);
    expect(items).toHaveLength(2);
    items.forEach((item) => expect(item.props("viewMode")).toBe("pipeline"));
  });

  it("draws one edge per declared relation between rendered entities", () => {
    const wrapper = mountPipeline(wemiFamily(), { config: WEMI_CONFIG });

    expect(wrapper.findAll('[data-cy="pipeline-edge"]')).toHaveLength(2);
  });

  it("draws no edges when the config declares no edge relations", () => {
    const wrapper = mountPipeline(wemiFamily());

    expect(wrapper.findAll('[data-cy="pipeline-edge"]')).toHaveLength(0);
    expect(wrapper.findAllComponents(ListItem)).toHaveLength(3);
  });

  it("places a WEMI family in three columns, left to right", () => {
    const wrapper = mountPipeline(wemiFamily(), { config: WEMI_CONFIG });

    const lefts = wrapper
      .findAll("[data-pipeline-node]")
      .map((node) => parseFloat(node.attributes("style")!.split("left:")[1]));
    const [w1, e1, m1] = lefts;
    expect(w1).toBeLessThan(e1);
    expect(e1).toBeLessThan(m1);
  });

  it("marks the ports that edges attach to", () => {
    const wrapper = mountPipeline(wemiFamily(), { config: WEMI_CONFIG });

    expect(wrapper.findAll('[data-cy="pipeline-port-out-out"]')).toHaveLength(
      2,
    );
    expect(wrapper.find('[data-cy="pipeline-port-in-refWork"]').exists()).toBe(
      true,
    );
    expect(
      wrapper.find('[data-cy="pipeline-port-in-refExpressions"]').exists(),
    ).toBe(true);
  });

  it("keeps the start of the flow in view: the canvas focuses the first root card", () => {
    const wrapper = mountPipeline(wemiFamily(), { config: WEMI_CONFIG });

    const root = wrapper
      .findAll("[data-pipeline-node]")
      .find((node) => node.find(".list-item-stub").exists())!;
    const left = parseFloat(root.attributes("style")!.split("left:")[1]);
    const top = parseFloat(root.attributes("style")!.split("top:")[1]);
    const focus = wrapper
      .findComponent({ name: "PipelineCanvas" })
      .props("focus") as { x: number; y: number };
    expect(focus.x).toBeGreaterThan(left);
    expect(focus.y).toBeGreaterThan(top);
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
  });

  it("renders no cards and no edges for an empty list", () => {
    const wrapper = mountPipeline([]);

    expect(wrapper.findAllComponents(ListItem)).toHaveLength(0);
    expect(wrapper.findAll('[data-cy="pipeline-edge"]')).toHaveLength(0);
  });

  it("shows the whole flow: unpaged fetch on mount, restored on unmount", () => {
    const setPaginationLimit = vi.fn();
    const wrapper = mountPipeline([makeEntity("a")], { setPaginationLimit });

    expect(setPaginationLimit).toHaveBeenCalledWith(1000, true);

    wrapper.unmount();
    expect(setPaginationLimit).toHaveBeenCalledWith(20, true);
  });

  it("uses a declared pagination limit", () => {
    const setPaginationLimit = vi.fn();
    mountPipeline([makeEntity("a")], {
      setPaginationLimit,
      config: [{ key: "paginationLimit", value: 250 }],
    });

    expect(setPaginationLimit).toHaveBeenCalledWith(250, true);
  });
});
