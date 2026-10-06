import { describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import BooleanFilter from "@/components/filters/matchers/exactMatcher/BooleanFilter.vue";

vi.mock("@/components/base/BaseInputCheckbox.vue", () => ({
  default: {
    name: "BaseInputCheckbox",
    props: ["label", "size"],
    template: "<div />",
  },
}));

const getWrapper = () =>
  shallowMount(BooleanFilter, {
    props: { filter: { inputFromState: undefined } as any },
  });

describe("BooleanFilter", () => {
  it("renders option rows at the table text size", () => {
    expect(getWrapper().classes()).toContain("text-table");
  });

  it("uses compact checkboxes for its yes/no options", () => {
    const sizes = getWrapper()
      .findAllComponents({ name: "BaseInputCheckbox" })
      .map((checkbox) => checkbox.props("size"));
    expect(sizes).toEqual(["compact", "compact"]);
  });
});
