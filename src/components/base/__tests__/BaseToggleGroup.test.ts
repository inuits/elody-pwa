import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import { nextTick, ref } from "vue";
import BaseToggleGroup from "../BaseToggleGroup.vue";
import { DamsIcons } from "@/generated-types/queries";

const uniconStub = { template: "<i></i>", props: ["name", "height"] };

const toggles = () => [
  { viewMode: "ViewModesList", isOn: ref(true), iconOn: DamsIcons.ListUl, iconOff: DamsIcons.ListUl },
  { viewMode: "ViewModesGrid", isOn: ref(false), iconOn: DamsIcons.Apps, iconOff: DamsIcons.Apps },
];

describe("BaseToggleGroup", () => {
  it("names the toggle the user turned on", async () => {
    const wrapper = mount(BaseToggleGroup, {
      props: { toggles: toggles() },
      global: { stubs: { unicon: uniconStub } },
    });
    await wrapper.findAll(".cursor-pointer")[1].trigger("click");
    expect(wrapper.emitted("selected")).toHaveLength(1);
    expect((wrapper.emitted("selected")![0][0] as { viewMode: string }).viewMode).toBe("ViewModesGrid");
  });

  it("says nothing when the page switches a toggle itself", async () => {
    const own = toggles();
    const wrapper = mount(BaseToggleGroup, {
      props: { toggles: own },
      global: { stubs: { unicon: uniconStub } },
    });
    own[0].isOn.value = false;
    own[1].isOn.value = true;
    await nextTick();
    expect(wrapper.emitted("selected")).toBeUndefined();
  });
});
