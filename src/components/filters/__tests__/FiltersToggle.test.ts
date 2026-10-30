import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import FiltersToggle from "@/components/filters/FiltersToggle.vue";

const mountToggle = (props = {}) =>
  mount(FiltersToggle, {
    props: { activeCount: 0, expanded: false, controls: "rail-1", ...props },
    global: {
      stubs: { unicon: true },
      mocks: {
        $t: (key: string, values?: Record<string, string>) =>
          values ? `${key}:${Object.values(values).join(",")}` : key,
      },
    },
  });

const toggle = (wrapper: ReturnType<typeof mountToggle>) =>
  wrapper.find('[data-cy="filters-toggle"]');

// user, 2026-10-30 (F1): the filter rail opens from a "Filters" button at the
// start of the list band, not from a bar above the list
describe("FiltersToggle", () => {
  it("is a button that opens the filter rail it controls", async () => {
    const wrapper = mountToggle();
    expect(toggle(wrapper).element.tagName).toBe("BUTTON");
    expect(toggle(wrapper).attributes("aria-expanded")).toBe("false");
    expect(toggle(wrapper).attributes("aria-controls")).toBe("rail-1");
    expect(toggle(wrapper).text()).toContain("filters.filter");
    await toggle(wrapper).trigger("click");
    expect(wrapper.emitted("toggle")).toHaveLength(1);
  });

  it("shows the active count as a badge and names it", () => {
    const wrapper = mountToggle({ activeCount: 2 });
    expect(wrapper.find('[data-cy="filters-toggle-count"]').text()).toBe("2");
    expect(toggle(wrapper).attributes("aria-label")).toBe(
      "filters.filter, 2 filters.active",
    );
  });

  it("has no badge without active filters", () => {
    const wrapper = mountToggle();
    expect(wrapper.find('[data-cy="filters-toggle-count"]').exists()).toBe(false);
    expect(toggle(wrapper).attributes("aria-label")).toBe("filters.filter");
  });

  it("looks pressed while the rail is open", () => {
    const wrapper = mountToggle({ expanded: true });
    expect(toggle(wrapper).attributes("aria-expanded")).toBe("true");
    expect(toggle(wrapper).classes()).toEqual(
      // a wash would vanish on the accent-light band; white + accent border
      // reads on any client's band
      expect.arrayContaining(["bg-surface", "border-accent", "text-text-accent-strong"]),
    );
  });

  // option (a): the applied saved search stays visible while the rail is shut
  it("shows the applied saved search beside it while the rail is closed", async () => {
    const wrapper = mountToggle({ savedSearchTitle: "Mine", savedSearchModified: true });
    const chip = wrapper.find('[data-cy="filters-saved-search"]');
    expect(chip.text()).toContain("Mine");
    expect(chip.attributes("aria-label")).toBe("saved-searches.remove-applied:Mine");
    expect(wrapper.find('[data-cy="filters-saved-search-modified"]').exists()).toBe(true);
    await chip.trigger("click");
    expect(wrapper.emitted("clearSavedSearch")).toHaveLength(1);
  });

  it("leaves the saved search to the rail header while the rail is open", () => {
    const wrapper = mountToggle({ expanded: true, savedSearchTitle: "Mine" });
    expect(wrapper.find('[data-cy="filters-saved-search"]').exists()).toBe(false);
  });
});
