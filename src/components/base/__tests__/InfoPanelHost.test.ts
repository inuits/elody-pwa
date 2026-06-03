import { describe, it, expect, beforeEach } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { nextTick } from "vue";
import InfoPanelHost from "../InfoPanelHost.vue";
import BaseInfoPanel from "../BaseInfoPanel.vue";
import { useInfoPanel } from "@/composables/useInfoPanel";

describe("InfoPanelHost", () => {
  beforeEach(() => {
    useInfoPanel().closePanel();
  });

  it("does not render a panel when none is active", () => {
    const wrapper = shallowMount(InfoPanelHost);
    expect(wrapper.findComponent(BaseInfoPanel).exists()).toBe(false);
  });

  it("renders the active panel with its title and content", async () => {
    const wrapper = shallowMount(InfoPanelHost);
    useInfoPanel().openPanel({
      title: "metadata.conventions.title",
      content: "<p>conventions</p>",
    });
    await nextTick();

    const panel = wrapper.findComponent(BaseInfoPanel);
    expect(panel.exists()).toBe(true);
    expect(panel.props("title")).toBe("metadata.conventions.title");
    expect(panel.props("content")).toBe("<p>conventions</p>");
  });

  it("closes the active panel when the panel emits close", async () => {
    const wrapper = shallowMount(InfoPanelHost);
    useInfoPanel().openPanel({
      title: "metadata.conventions.title",
      content: "<p>conventions</p>",
    });
    await nextTick();

    await wrapper.findComponent(BaseInfoPanel).vm.$emit("close");
    await nextTick();

    expect(wrapper.findComponent(BaseInfoPanel).exists()).toBe(false);
    expect(useInfoPanel().activePanel.value).toBeNull();
  });
});
