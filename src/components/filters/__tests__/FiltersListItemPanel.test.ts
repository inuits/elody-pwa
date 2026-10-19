import { describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import FiltersListItemPanel from "@/components/filters/FiltersListItemPanel.vue";

vi.mock("@/generated-types/queries", () => ({
  DamsIcons: { Cross: "Cross" },
}));
vi.mock("@/components/base/AdvancedDropdown.vue", () => ({
  default: { name: "AdvancedDropdown", template: "<div />" },
}));
vi.mock("@/components/base/BaseButtonNew.vue", () => ({
  default: { name: "BaseButtonNew", template: "<button />" },
}));

const panel = () =>
  shallowMount(FiltersListItemPanel, {
    props: { matchers: [], selectedMatcher: undefined, defaultLabel: "" },
  }).find('[data-cy="filters-list-item-panel"]');

describe("FiltersListItemPanel", () => {
  it("uses the compact 8/12px section padding", () => {
    expect(panel().classes()).toEqual(
      expect.arrayContaining(["px-3", "py-2"]),
    );
  });

  it("spaces its controls 6px apart", () => {
    expect(panel().classes()).toContain("gap-1.5");
  });

  it("closes the section with a faint bottom border", () => {
    expect(panel().classes()).toEqual(
      expect.arrayContaining(["border-b", "border-border-faint"]),
    );
  });

  it("names its icon-only clear button", () => {
    expect(
      panel().findComponent({ name: "BaseButtonNew" }).attributes("aria-label"),
    ).toBe(
      "filters.clear-filter",
    );
  });

  describe("text filter form (catalogue TextFilter)", () => {
    const two = [
      { label: "contains", value: "ContainsMatcher" },
      { label: "exact", value: "ExactInputMatcher" },
    ];
    const mountWith = (matchers: unknown[], selectedMatcher: string) =>
      shallowMount(FiltersListItemPanel, {
        props: { matchers, selectedMatcher, defaultLabel: "" },
        slots: { default: '<input data-cy="matcher-input" />' },
      });

    it("puts the mode inside the input box as a prefix", () => {
      const box = mountWith(two, "ContainsMatcher").find(
        '[data-cy="filter-input-box"]',
      );
      expect(box.classes()).toEqual(
        expect.arrayContaining(["border", "border-border-default", "rounded-input"]),
      );
      expect(box.findComponent({ name: "AdvancedDropdown" }).exists()).toBe(true);
      expect(box.find('[data-cy="matcher-input"]').exists()).toBe(true);
    });

    it("keeps the filled clear button beside the box", () => {
      const wrapper = mountWith(two, "ContainsMatcher");
      expect(
        wrapper
          .find('[data-cy="filter-input-box"]')
          .findComponent({ name: "BaseButtonNew" })
          .exists(),
      ).toBe(false);
      expect(wrapper.findComponent({ name: "BaseButtonNew" }).exists()).toBe(true);
    });

    it("has no mode when the filter offers a single matcher", () => {
      const wrapper = mountWith([two[0]], "ContainsMatcher");
      expect(wrapper.findComponent({ name: "AdvancedDropdown" }).exists()).toBe(
        false,
      );
      expect(wrapper.find('[data-cy="matcher-input"]').exists()).toBe(true);
    });

    it("stacks the mode above matchers with two fields or a slider", () => {
      const wrapper = mountWith(
        [...two, { label: "between", value: "InBetweenMatcher" }],
        "InBetweenMatcher",
      );
      expect(wrapper.find('[data-cy="filter-input-box"]').exists()).toBe(false);
      expect(wrapper.findComponent({ name: "AdvancedDropdown" }).exists()).toBe(
        true,
      );
    });
  });
});
