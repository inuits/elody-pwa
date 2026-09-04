import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import PipelineListItemCard from "../PipelineListItemCard.vue";

vi.mock("@/composables/useEntitySingle", () => ({
  default: () => ({ getEntityUuid: () => "parent-1" }),
}));

const stubs = {
  BaseContextMenuActions: true,
  MultilingualWrapper: {
    template: "<div><slot :localized-metadata='undefined' /></div>",
  },
  ReadOnlyMetadataWrapper: {
    props: ["metadata"],
    template: "<span class='meta'>{{ metadata.key }}</span>",
  },
};

const teaserMetadata = [
  { key: "type", label: "Type", value: { formatter: "pill|auto" } },
  { key: "name", label: "Name", value: "alert-monitor" },
  { key: "consumes", label: "Consumes", value: "Error events" },
  {
    key: "wiring",
    label: "Connected to",
    value: "reader|out",
    hideOnPipelineCard: true,
  },
];

const mountCard = (props: Record<string, unknown> = {}) =>
  mount(PipelineListItemCard, {
    props: {
      bulkOperationsContext: undefined,
      relation: "no-relation-found",
      itemId: "a",
      teaserMetadata,
      ...props,
    },
    global: { stubs },
  });

describe("PipelineListItemCard", () => {
  it("drops the type pill and structurally hidden fields, keeps the rest", () => {
    const wrapper = mountCard();

    const visible = wrapper.findAll(".meta").map((node) => node.text());
    // the type pill says nothing in a flow; fields flagged
    // hideOnPipelineCard (like wiring rows) are redundant next to the edges
    expect(visible).toEqual(["name", "consumes"]);
  });
});
