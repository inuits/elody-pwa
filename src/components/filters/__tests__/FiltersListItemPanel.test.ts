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

  it("sits on white, without a tinted background (aicap mockup)", () => {
    expect(panel().classes()).not.toContain("bg-surface-group-form");
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

    it("draws the mode as a small muted prefix segment", () => {
      const prefix = mountWith(two, "ContainsMatcher")
        .find('[data-cy="filter-input-box"]')
        .findComponent({ name: "AdvancedDropdown" });
      expect(prefix.classes()).toEqual(
        expect.arrayContaining([
          "[--vs-font-size:var(--text-hint)]",
          "[--vs-text-color:var(--color-text-muted)]",
          "bg-surface-muted",
        ]),
      );
    });

    it("rings the whole box on focus instead of the clipped inner input", () => {
      const box = mountWith(two, "ContainsMatcher").find('[data-cy="filter-input-box"]');
      expect(box.classes()).toEqual(
        expect.arrayContaining([
          "has-[input:focus-visible]:outline-(length:--focus-ring-width)",
          "has-[input:focus-visible]:outline-(color:--color-focus-ring)",
          "[&_input:not([type=checkbox])]:!outline-none",
        ]),
      );
    });

    it("sets the typed value at the catalogue's table size", () => {
      expect(
        mountWith(two, "ContainsMatcher").find('[data-cy="filter-input-box"]').classes(),
      ).toContain("[&_input:not([type=checkbox])]:!text-table");
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

    it("stacks the mode above a matcher that renders a checkbox list", () => {
      const wrapper = shallowMount(FiltersListItemPanel, {
        props: { matchers: two, selectedMatcher: "ExactAutoCompleteMatcher", defaultLabel: "", stacked: true },
        slots: { default: '<input type="checkbox" data-cy="matcher-input" />' },
      });
      expect(wrapper.find('[data-cy="filter-input-box"]').exists()).toBe(false);
      expect(wrapper.find('[data-cy="matcher-input"]').exists()).toBe(true);
    });

    it("gives a stacked list the full panel width, the clear button on the mode row", () => {
      const wrapper = shallowMount(FiltersListItemPanel, {
        props: { matchers: two, selectedMatcher: "ExactAutoCompleteMatcher", defaultLabel: "", stacked: true },
        slots: { default: '<input type="checkbox" data-cy="matcher-input" />' },
      });
      expect(
        wrapper.find('[data-cy="matcher-input"]').element.parentElement!.className,
      ).toContain("col-span-2");
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
