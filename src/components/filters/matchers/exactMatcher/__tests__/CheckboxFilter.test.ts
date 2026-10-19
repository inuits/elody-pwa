import { describe, it, expect, vi } from "vitest";
import { flushPromises, shallowMount } from "@vue/test-utils";
import CheckboxFilter from "@/components/filters/matchers/exactMatcher/CheckboxFilter.vue";

vi.mock("@/components/base/BaseInputCheckbox.vue", () => ({
  default: {
    name: "BaseInputCheckbox",
    props: ["label", "size", "ariaLabel"],
    template: "<div />",
  },
}));

const getWrapper = () =>
  shallowMount(CheckboxFilter, {
    props: {
      options: [
        { label: "BOEK (812)", value: "book" },
        { label: "DVD", value: "dvd" },
      ],
      filter: { inputFromState: undefined } as any,
    },
  });

describe("CheckboxFilter", () => {
  it("renders option rows at the table text size", () => {
    expect(getWrapper().classes()).toContain("text-table");
  });

  it("uses compact checkboxes for its option rows", async () => {
    const wrapper = getWrapper();
    await flushPromises();
    const sizes = wrapper
      .findAllComponents({ name: "BaseInputCheckbox" })
      .map((checkbox) => checkbox.props("size"));
    expect(sizes).toEqual(["compact", "compact"]);
  });

  it("shows the option count in its own muted column, like the catalogue", async () => {
    const wrapper = getWrapper();
    await flushPromises();
    const [book, dvd] = wrapper.findAll('[data-cy="checkbox-filter-option"]');
    expect(book.findComponent({ name: "BaseInputCheckbox" }).props("label")).toBe("BOEK");
    expect(book.find('[data-cy="checkbox-filter-count"]').text()).toBe("812");
    expect(book.find('[data-cy="checkbox-filter-count"]').classes()).toContain(
      "text-text-subtle",
    );
    expect(dvd.find('[data-cy="checkbox-filter-count"]').exists()).toBe(false);
  });

  it("keeps the count in the checkbox's accessible name (handoff)", async () => {
    const wrapper = getWrapper();
    await flushPromises();
    expect(
      wrapper.findAllComponents({ name: "BaseInputCheckbox" })[0].props("ariaLabel"),
    ).toBe("BOEK, 812");
  });

  it("highlights an option row on hover", async () => {
    const wrapper = getWrapper();
    await flushPromises();
    expect(wrapper.find('[data-cy="checkbox-filter-option"]').classes()).toContain(
      "hover:bg-accent-wash",
    );
  });
});
