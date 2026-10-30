import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import FiltersPane from "@/components/filters/FiltersPane.vue";

// user, 2026-10-30: the filters open as a column inside the list panel; its
// top row holds the Filters button, level with the list band
describe("FiltersPane", () => {
  it("offers a head spot for the Filters button and a body spot for the filters", () => {
    const wrapper = mount(FiltersPane, { props: { open: true, paneId: "p1" } });
    const head = wrapper.find('[data-filters-pane-head="p1"]');
    expect(head.exists()).toBe(true);
    expect(head.classes()).toEqual(
      // the panel's top-left corner
      expect.arrayContaining(["p-(--list-band-pad)", "bg-surface-panel-header", "rounded-tl-card"]),
    );
    expect(wrapper.find('[data-filters-pane-body="p1"]').exists()).toBe(true);
  });

  it("is a fixed-width column with a divider towards the list", () => {
    const wrapper = mount(FiltersPane, { props: { open: true, paneId: "p1" } });
    expect(wrapper.classes()).toEqual(
      expect.arrayContaining([
        "w-(--filter-pane-width)",
        "shrink-0",
        "border-r",
        "border-border-panel",
      ]),
    );
  });

  // the filters stay mounted (their state lives there) while the pane is shut
  it("hides without unmounting while closed", () => {
    const wrapper = mount(FiltersPane, { props: { open: false, paneId: "p1" } });
    expect(wrapper.find('[data-filters-pane-body="p1"]').exists()).toBe(true);
    expect((wrapper.element as HTMLElement).style.display).toBe("none");
  });
});
