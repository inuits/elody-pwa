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

const mountCard = (props: Record<string, unknown> = {}) =>
  mount(PipelineListItemCard, {
    props: {
      bulkOperationsContext: undefined,
      relation: "no-relation-found",
      itemId: "a",
      teaserMetadata: [
        { key: "kind", label: "Type", value: { formatter: "pill|auto" } },
        { key: "title", label: "Title", value: "Le petit prince" },
        { key: "internal", label: "Internal", showOnlyInEditMode: true },
      ],
      ...props,
    },
    global: { stubs },
  });

describe("PipelineListItemCard", () => {
  it("renders the read-mode teaser metadata in declared order", () => {
    const wrapper = mountCard();

    expect(wrapper.findAll(".meta").map((node) => node.text())).toEqual([
      "kind",
      "title",
    ]);
  });

  it("offers the entity's context menu", () => {
    const wrapper = mountCard();

    expect(
      wrapper.findComponent({ name: "BaseContextMenuActions" }).exists(),
    ).toBe(true);
  });

  it("greys out a disabled entity", () => {
    const wrapper = mountCard({ isDisabled: true });

    expect(wrapper.find("li").classes()).toContain("grayscale");
  });
});
