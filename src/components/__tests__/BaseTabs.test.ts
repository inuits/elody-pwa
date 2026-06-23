import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import BaseTabs from "../BaseTabs.vue";

const tabs = ["Role", "User"];

describe("BaseTabs", () => {
  it("renders classic tab labels by default", () => {
    const wrapper = mount(BaseTabs, {
      props: { tabs, tabNavigationDisabled: false },
    });
    expect(wrapper.find('[data-testid="base-tabs-step-strip"]').exists()).toBe(
      false,
    );
    const items = wrapper.findAll('[data-testid="base-tabs-tab"]');
    expect(items).toHaveLength(2);
    expect(items[0].classes()).toContain("cursor-pointer");
  });

  it("drops cursor-pointer when tabNavigationDisabled is true", () => {
    const wrapper = mount(BaseTabs, {
      props: { tabs, tabNavigationDisabled: true },
    });
    const items = wrapper.findAll('[data-testid="base-tabs-tab"]');
    expect(items[0].classes()).not.toContain("cursor-pointer");
  });

  it("renders numbered step strip when stepStrip is true", () => {
    const wrapper = mount(BaseTabs, {
      props: { tabs, tabNavigationDisabled: true, stepStrip: true },
    });
    const strip = wrapper.find('[data-testid="base-tabs-step-strip"]');
    expect(strip.exists()).toBe(true);
    const steps = strip.findAll('[data-testid="base-tabs-step"]');
    expect(steps).toHaveLength(2);
    expect(steps[0].text()).toContain("1");
    expect(steps[0].text()).toContain("Role");
    expect(steps[1].text()).toContain("2");
    expect(steps[1].text()).toContain("User");
    expect(strip.findAll('[data-testid="base-tabs-step-separator"]')).toHaveLength(1);
  });

  it("highlights current step in step strip", async () => {
    const wrapper = mount(BaseTabs, {
      props: { tabs, tabNavigationDisabled: true, stepStrip: true },
    });
    const firstCircle = wrapper.find(
      '[data-testid="base-tabs-step"]:first-child [data-testid="base-tabs-step-circle"]',
    );
    expect(firstCircle.classes().join(" ")).toMatch(/bg-accent-accent/);
  });
});
