import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import WysiwygDiffFlag from "../WysiwygDiffFlag.vue";

describe("WysiwygDiffFlag", () => {
  it("shows the label and an unchanged indicator when changed is false", () => {
    const wrapper = mount(WysiwygDiffFlag, { props: { label: "Reading", changed: false } });
    expect(wrapper.text()).toContain("Reading");
    expect(wrapper.text()).toContain("Unchanged");
  });

  it("shows a changed indicator when changed is true", () => {
    const wrapper = mount(WysiwygDiffFlag, { props: { label: "Commentary", changed: true } });
    expect(wrapper.text()).toContain("Commentary");
    expect(wrapper.text()).toContain("Changed");
  });

  it("applies distinct styling for the changed state", () => {
    const wrapper = mount(WysiwygDiffFlag, { props: { label: "Reading", changed: true } });
    expect(wrapper.findAll("span")[1].classes()).toContain("bg-green-100");
  });
});
