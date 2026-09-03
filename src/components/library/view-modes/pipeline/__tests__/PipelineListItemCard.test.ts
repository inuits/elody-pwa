import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import PipelineListItemCard from "../PipelineListItemCard.vue";
import { pipelineViewConfigFrom } from "../../composables/usePipelineViewConfig";

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
  { key: "contracts.consumes", label: "Consumes", value: "Error events" },
  { key: "contracts.produces", label: "Produces", value: "Alerts" },
  { key: "contracts.produces.iri", label: "", value: "http://x/AlertShape" },
  { key: "connections.in.from", label: "Connected to", value: "reader|out" },
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
  it("shows the contract facts as chips and keeps bookkeeping off the card", () => {
    const wrapper = mountCard();

    const chips = wrapper.findAll("[data-cy^='pipeline-contract-']");
    expect(chips.map((chip) => chip.text())).toEqual([
      "Consumes: Error events",
      "Produces: Alerts",
    ]);

    const visible = wrapper.findAll(".meta").map((node) => node.text());
    // the type pill says nothing in a pipeline, the raw IRIs and the wiring
    // are bookkeeping the edges already draw
    expect(visible).toEqual(["name"]);
  });

  it("follows the declared convention keys instead of hardcoded ones", () => {
    const wrapper = mountCard({
      teaserMetadata: [
        { key: "name", label: "Name", value: "alert-monitor" },
        { key: "io.consumes", label: "Consumes", value: "Error events" },
        { key: "wiring.in.from", label: "Connected to", value: "reader|out" },
        { key: "contracts.consumes", label: "Old", value: "not a contract here" },
      ],
      viewConfig: pipelineViewConfigFrom([
        { key: "contractsKey", value: "io" },
        { key: "connectionsKey", value: "wiring" },
      ] as any),
    });

    const chips = wrapper.findAll("[data-cy^='pipeline-contract-']");
    expect(chips.map((chip) => chip.text())).toEqual([
      "Consumes: Error events",
    ]);

    const visible = wrapper.findAll(".meta").map((node) => node.text());
    expect(visible).toContain("name");
    expect(visible).toContain("contracts.consumes");
    expect(visible).not.toContain("wiring.in.from");
  });
});
