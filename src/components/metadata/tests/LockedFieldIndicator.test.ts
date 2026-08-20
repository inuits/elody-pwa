import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import LockedFieldIndicator from "../LockedFieldIndicator.vue";

const uniconStub = {
  template: '<div data-testid="unicon" :aria-label="name"></div>',
  props: ["height", "name"],
};

const baseTooltipStub = {
  template:
    '<div class="base-tooltip-stub"><slot name="activator" :on="{}" /><slot /></div>',
};

const getWrapper = (props: Record<string, any>) =>
  mount(LockedFieldIndicator, {
    props,
    global: {
      stubs: {
        unicon: uniconStub,
        BaseTooltip: baseTooltipStub,
        "base-tooltip": baseTooltipStub,
      },
    },
  });

describe("LockedFieldIndicator", () => {
  it("renders nothing when not locked", () => {
    const wrapper = getWrapper({ isLocked: false });

    expect(
      wrapper.find('[data-testid="locked-field-indicator"]').exists(),
    ).toBe(false);
  });

  it("renders the indicator when locked", () => {
    const wrapper = getWrapper({ isLocked: true });

    expect(
      wrapper.find('[data-testid="locked-field-indicator"]').exists(),
    ).toBe(true);
  });

  it("falls back to the generic tooltip when no per-field tooltip is given", () => {
    const wrapper = getWrapper({ isLocked: true });

    expect(wrapper.text()).toContain("metadata.tooltips.locked-field");
  });

  it("uses the per-field tooltip when provided", () => {
    const wrapper = getWrapper({
      isLocked: true,
      tooltip: "metadata.tooltips.reading-locked",
    });

    expect(wrapper.text()).toContain("metadata.tooltips.reading-locked");
    expect(wrapper.text()).not.toContain("metadata.tooltips.locked-field");
  });

  it("defaults to the top-right position", () => {
    const wrapper = getWrapper({ isLocked: true });

    const indicator = wrapper.find('[data-testid="locked-field-indicator"]');
    expect(indicator.classes()).toContain("top-1");
    expect(indicator.classes()).toContain("right-1");
    expect(indicator.classes()).not.toContain("top-1/2");
  });

  it("positions itself vertically centered on the right when position is middle-right", () => {
    const wrapper = getWrapper({ isLocked: true, position: "middle-right" });

    const indicator = wrapper.find('[data-testid="locked-field-indicator"]');
    expect(indicator.classes()).toContain("top-1/2");
    expect(indicator.classes()).toContain("-translate-y-1/2");
    expect(indicator.classes()).toContain("right-1");
    expect(indicator.classes()).not.toContain("top-1");
  });
});
