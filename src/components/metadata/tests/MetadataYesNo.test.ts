import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (key: string) => key }) }));

import MetadataYesNo from "@/components/metadata/MetadataYesNo.vue";

const uniconStub = { name: "unicon", props: ["name", "height"], template: "<i />" };
const render = (value: unknown) =>
  mount(MetadataYesNo, { props: { value }, global: { stubs: { unicon: uniconStub } } });

describe("MetadataYesNo", () => {
  it("reads like any other value: value size and colour", () => {
    expect(render(true).classes()).toEqual(
      expect.arrayContaining(["text-value", "text-text-secondary"]),
    );
  });

  it("says yes with a check in the success colour", () => {
    const wrapper = render(true);
    expect(wrapper.text()).toBe("metadata.labels.yes");
    const icon = wrapper.findComponent(uniconStub);
    expect(icon.props("height")).toBe("14");
    expect(icon.classes()).toContain("text-success");
  });

  it("says no with a cross in the value colour", () => {
    const wrapper = render(false);
    expect(wrapper.text()).toBe("metadata.labels.no");
    expect(wrapper.findComponent(uniconStub).classes()).toContain("text-text-secondary");
  });
});
