import { describe, it, expect, vi } from "vitest";
import { flushPromises, shallowMount } from "@vue/test-utils";
import CheckboxFilter from "@/components/filters/matchers/exactMatcher/CheckboxFilter.vue";

vi.mock("@/components/base/BaseInputCheckbox.vue", () => ({
  default: {
    name: "BaseInputCheckbox",
    props: ["label", "size"],
    template: "<div />",
  },
}));

const getWrapper = () =>
  shallowMount(CheckboxFilter, {
    props: {
      options: [
        { label: "BOEK", value: "book" },
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
});
