import { describe, it, expect } from "vitest";
import { shallowMount } from "@vue/test-utils";
import MetadataValueTooltip from "@/components/metadata/MetadataValueTooltip.vue";
import { PanelMetadataValueTooltipTypes } from "@/generated-types/queries";

const mountTooltip = (type: PanelMetadataValueTooltipTypes, value?: string) =>
  shallowMount(MetadataValueTooltip, {
    props: {
      valueTooltip: { type, value } as never,
      entity: { id: "1", metadata: [] } as never,
    },
  });

describe("MetadataValueTooltip", () => {
  it("shows the tooltip for a plain tooltip with a value", () => {
    const wrapper = mountTooltip(PanelMetadataValueTooltipTypes.Plane, "Help");
    expect(wrapper.findComponent({ name: "BaseTooltip" }).exists()).toBe(true);
  });

  it("shows the tooltip for a preview tooltip when there is an entity", () => {
    const wrapper = mountTooltip(PanelMetadataValueTooltipTypes.Preview);
    expect(wrapper.findComponent({ name: "BaseTooltip" }).exists()).toBe(true);
  });

  it("hides a plain tooltip without a value", () => {
    const wrapper = mountTooltip(PanelMetadataValueTooltipTypes.Plane);
    expect(wrapper.findComponent({ name: "BaseTooltip" }).exists()).toBe(false);
  });
});
