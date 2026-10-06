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
});
