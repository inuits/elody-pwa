import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import BaseInfoPanel from "../BaseInfoPanel.vue";
import SanitizedHtml from "@/components/SanitizedHtml.vue";
import { SanitizeMode } from "@/generated-types/queries";

const uniconStub = {
  template: '<div data-testid="unicon" :aria-label="name"></div>',
  props: ["height", "name"],
};

const getDefaultProps = () => ({
  title: "metadata.conventions.title",
  content: "<p>The sign <i>x</i> means addition</p>",
});

const getWrapper = (
  props = getDefaultProps(),
  { stubTeleport = true } = {},
) =>
  mount(BaseInfoPanel, {
    props,
    attachTo: document.body,
    global: {
      stubs: {
        unicon: uniconStub,
        ...(stubTeleport ? { teleport: true } : {}),
      },
    },
  });

describe("BaseInfoPanel", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("renders the translated title", () => {
    const wrapper = getWrapper();
    expect(wrapper.find('[data-testid="info-panel-title"]').text()).toContain(
      "metadata.conventions.title",
    );
  });

  it("renders the body content through SanitizedHtml in HTML mode", () => {
    const wrapper = getWrapper();
    const sanitized = wrapper.findComponent(SanitizedHtml);
    expect(sanitized.exists()).toBe(true);
    expect(sanitized.props("content")).toBe(
      "<p>The sign <i>x</i> means addition</p>",
    );
    expect(sanitized.props("mode")).toBe(SanitizeMode.Html);
  });

  it("emits close when the close button is clicked", async () => {
    const wrapper = getWrapper();
    await wrapper.find('[data-testid="info-panel-close-button"]').trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("is pinned to the bottom of the screen", () => {
    const wrapper = getWrapper();
    const panel = wrapper.find('[data-testid="info-panel"]');
    const classes = panel.classes();
    expect(classes).toContain("fixed");
    expect(classes.some((c) => c.startsWith("bottom"))).toBe(true);
  });

  it("renders no backdrop/overlay element", () => {
    const wrapper = getWrapper();
    expect(wrapper.find('[data-testid="info-panel-backdrop"]').exists()).toBe(
      false,
    );
  });

  it("teleports the panel to the document body", () => {
    getWrapper(getDefaultProps(), { stubTeleport: false });
    expect(
      document.body.querySelector('[data-testid="info-panel"]'),
    ).not.toBeNull();
  });
});
