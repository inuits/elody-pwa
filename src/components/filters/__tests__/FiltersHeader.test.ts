import { shallowMount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import FiltersHeader from "../FiltersHeader.vue";

const getWrapper = (props: Record<string, unknown> = {}) =>
  shallowMount(FiltersHeader, {
    props: { activeCount: 2, expanded: false, ...props },
    global: {
      stubs: { unicon: true },
      mocks: {
        $t: (key: string, params?: Record<string, unknown>) =>
          params ? `${key}:${Object.values(params).join(",")}` : key,
      },
    },
  });

describe("FiltersHeader (rail header band)", () => {
  it("is the accent-light band of the mockup", () => {
    expect(getWrapper().find('[data-cy="filters-header"]').classes()).toEqual(
      expect.arrayContaining(["bg-surface-panel-header", "border-border-panel"]),
    );
  });

  it("titles the rail in accent ink", () => {
    expect(getWrapper().find("h2").classes()).toEqual(
      expect.arrayContaining(["text-table", "font-black", "text-text-panel-header"]),
    );
  });

  it("shows the active count as a white status chip", () => {
    const chip = getWrapper().find('[data-cy="filters-active-count"]');
    expect(chip.attributes("role")).toBe("status");
    expect(chip.text()).toBe("2 filters.active");
    expect(chip.classes()).toEqual(expect.arrayContaining(["bg-surface", "rounded-pill"]));
  });

  it("is a keyboard toggle that says whether the rail is open", async () => {
    const wrapper = getWrapper({ expanded: true });
    const toggle = wrapper.find('[data-cy="filters-header"]');
    expect(toggle.attributes("aria-expanded")).toBe("true");
    await toggle.trigger("keydown", { key: "Enter" });
    expect(wrapper.emitted("toggle")).toHaveLength(1);
  });

  it("shows the applied saved search as a removable chip", async () => {
    const wrapper = getWrapper({ savedSearchTitle: "My search" });
    const chip = wrapper.find('[data-cy="filters-saved-search"]');
    expect(chip.text()).toContain("My search");
    expect(chip.attributes("aria-label")).toBe(
      "saved-searches.remove-applied:My search",
    );
    await chip.trigger("click");
    expect(wrapper.emitted("clearSavedSearch")).toHaveLength(1);
    expect(wrapper.emitted("toggle")).toBeUndefined();
  });

  it("marks a saved search whose filters were changed", () => {
    const dot = (modified: boolean) =>
      getWrapper({ savedSearchTitle: "My search", savedSearchModified: modified })
        .find('[data-cy="filters-saved-search-modified"]')
        .exists();
    expect(dot(false)).toBe(false);
    expect(dot(true)).toBe(true);
  });

  it("has no saved-search chip when none is applied", () => {
    expect(getWrapper().find('[data-cy="filters-saved-search"]').exists()).toBe(false);
  });
});
