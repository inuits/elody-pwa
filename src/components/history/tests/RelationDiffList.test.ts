import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import RelationDiffList from "../RelationDiffList.vue";

describe("RelationDiffList", () => {
  it("renders one chip per item with its label", () => {
    const wrapper = mount(RelationDiffList, {
      props: {
        items: [
          { key: "word-1", label: "Amun", status: "unchanged" },
          { key: "word-2", label: "Ra", status: "added" },
        ],
      },
    });
    expect(wrapper.text()).toContain("Amun");
    expect(wrapper.text()).toContain("Ra");
    expect(wrapper.findAll('[data-cy="relation-diff-chip"]')).toHaveLength(2);
  });

  it("applies the removed styling to removed items, without a strike-through", () => {
    const wrapper = mount(RelationDiffList, {
      props: {
        items: [{ key: "word-1", label: "Amun", status: "removed" }],
      },
    });
    expect(wrapper.find("span").classes()).toEqual(
      expect.arrayContaining(["bg-diff-old-bg", "text-diff-old"]),
    );
    expect(wrapper.find("span").classes()).not.toContain("line-through");
  });

  it("applies the added styling to added items", () => {
    const wrapper = mount(RelationDiffList, {
      props: {
        items: [{ key: "word-2", label: "Ra", status: "added" }],
      },
    });
    expect(wrapper.find("span").classes()).toEqual(
      expect.arrayContaining(["bg-diff-new-bg", "text-diff-new"]),
    );
  });

  it("shows a renamed relation in green with its current name", () => {
    const wrapper = mount(RelationDiffList, {
      props: {
        items: [
          { key: "p-1", label: "New name", status: "renamed", variant: "current" },
        ],
      },
    });
    expect(wrapper.find("span").classes()).toContain("text-diff-new");
    expect(wrapper.find("span").classes()).not.toContain("line-through");
  });

  it("shows a renamed relation in red with its previous name, without striking it through", () => {
    const wrapper = mount(RelationDiffList, {
      props: {
        items: [
          { key: "p-1", label: "Old name", status: "renamed", variant: "previous" },
        ],
      },
    });
    expect(wrapper.find("span").classes()).toContain("text-diff-old");
    expect(wrapper.find("span").classes()).not.toContain("line-through");
  });

  it("labels a renamed relation as renamed on both sides", () => {
    const wrapper = mount(RelationDiffList, {
      props: {
        items: [
          { key: "p-1", label: "New name", status: "renamed", variant: "current" },
          { key: "p-2", label: "Old name", status: "renamed", variant: "previous" },
        ],
      },
    });
    const chips = wrapper.findAll("span").filter((chip) => chip.text().includes("name"));
    expect(chips[0].text()).toContain("New name");
    expect(chips[0].text()).toContain("history.renamed");
    expect(chips[1].text()).toContain("history.renamed");
  });

  it("does not label added, removed or unchanged relations as renamed", () => {
    const wrapper = mount(RelationDiffList, {
      props: {
        items: [
          { key: "w-1", label: "Amun", status: "unchanged" },
          { key: "w-2", label: "Ra", status: "added" },
          { key: "w-3", label: "Set", status: "removed" },
        ],
      },
    });
    expect(wrapper.text()).not.toContain("history.renamed");
  });

  it("renders nothing when items is empty", () => {
    const wrapper = mount(RelationDiffList, { props: { items: [] } });
    expect(wrapper.findAll('[data-cy="relation-diff-chip"]')).toHaveLength(0);
  });

  it("does not render a chip for an unchanged item with an empty label", () => {
    const wrapper = mount(RelationDiffList, {
      props: {
        items: [{ key: "word-1", label: "", status: "unchanged" }],
      },
    });
    expect(wrapper.findAll('[data-cy="relation-diff-chip"]')).toHaveLength(0);
  });

  it("does not render a chip for an unchanged item whose label fell back to its own key", () => {
    const wrapper = mount(RelationDiffList, {
      props: {
        items: [{ key: "word-1", label: "word-1", status: "unchanged" }],
      },
    });
    expect(wrapper.findAll('[data-cy="relation-diff-chip"]')).toHaveLength(0);
  });

  it("still renders an unchanged item that has a real, resolved label", () => {
    const wrapper = mount(RelationDiffList, {
      props: {
        items: [{ key: "word-1", label: "Amun", status: "unchanged" }],
      },
    });
    expect(wrapper.findAll('[data-cy="relation-diff-chip"]')).toHaveLength(1);
    expect(wrapper.text()).toContain("Amun");
  });

  it("still renders an added item without a resolved label", () => {
    const wrapper = mount(RelationDiffList, {
      props: {
        items: [{ key: "word-1", label: "word-1", status: "added" }],
      },
    });
    expect(wrapper.findAll('[data-cy="relation-diff-chip"]')).toHaveLength(1);
  });

  it("still renders a removed item without a resolved label", () => {
    const wrapper = mount(RelationDiffList, {
      props: {
        items: [{ key: "word-1", label: "", status: "removed" }],
      },
    });
    expect(wrapper.findAll('[data-cy="relation-diff-chip"]')).toHaveLength(1);
  });

  describe("design-system diff mark-up", () => {
    const chip = (status: string, variant?: string) =>
      mount(RelationDiffList, {
        props: { items: [{ key: "k", label: "Amun", status, variant }] },
      }).find('[data-cy="relation-diff-chip"]');

    it("uses the chip shape and size", () => {
      expect(chip("unchanged").classes()).toEqual(
        expect.arrayContaining(["rounded-chip", "text-chip", "p-(--chip-padding)"]),
      );
    });

    it("shows unchanged relations as neutral chips", () => {
      expect(chip("unchanged").classes()).toContain("bg-chip-neutral-bg");
    });

    it("uses no raw Tailwind palette colours", () => {
      ["unchanged", "added", "removed"].forEach((status) =>
        expect(chip(status).classes().join(" ")).not.toMatch(
          /(red|green|gray)-[0-9]/,
        ),
      );
    });

    it("announces additions and removals in text, not only in colour", () => {
      expect(chip("added").find(".sr-only").text()).toBe("added");
      expect(chip("removed").find(".sr-only").text()).toBe("removed");
    });

    it("adds no announcement to unchanged relations", () => {
      expect(chip("unchanged").find(".sr-only").exists()).toBe(false);
    });
  });
});
