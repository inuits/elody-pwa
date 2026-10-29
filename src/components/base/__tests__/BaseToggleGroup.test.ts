import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import { nextTick, ref } from "vue";
import BaseToggleGroup from "../BaseToggleGroup.vue";
import { DamsIcons } from "@/generated-types/queries";

const getWrapper = () => {
  const list = ref(true);
  const map = ref(false);
  const wrapper = mount(BaseToggleGroup, {
    props: {
      toggles: [
        { isOn: list, iconOn: DamsIcons.ListUl, iconOff: DamsIcons.ListUl, label: "library.view-modes.list" },
        { isOn: map, iconOn: DamsIcons.Map, iconOff: DamsIcons.Map, label: "library.view-modes.map" },
      ],
    },
    global: {
      stubs: { unicon: true, BaseTooltip: { template: '<div><slot name="activator" :on="{}" /><slot /></div>' } },
      mocks: { $t: (key: string) => key },
    },
  });
  return { wrapper, list, map };
};

describe("BaseToggleGroup (view switch)", () => {
  it("is a named group of real buttons", () => {
    const { wrapper } = getWrapper();
    expect(wrapper.find('[role="group"]').attributes("aria-label")).toBe(
      "library.view-mode",
    );
    expect(
      wrapper.findAll("button").map((b) => b.attributes("aria-label")),
    ).toEqual(["library.view-modes.list", "library.view-modes.map"]);
  });

  it("marks the active view as pressed, in accent wash", () => {
    const [list, map] = getWrapper().wrapper.findAll("button");
    expect(list.attributes("aria-pressed")).toBe("true");
    expect(list.classes()).toEqual(
      expect.arrayContaining(["bg-accent-wash", "text-accent-ink"]),
    );
    expect(map.attributes("aria-pressed")).toBe("false");
  });

  it("switches to the clicked view only", async () => {
    const { wrapper, list, map } = getWrapper();
    await wrapper.findAll("button")[1].trigger("click");
    expect(map.value).toBe(true);
    expect(list.value).toBe(false);
  });

  it("is one bordered capsule like the band's other controls", () => {
    expect(getWrapper().wrapper.find('[role="group"]').classes()).toEqual(
      expect.arrayContaining(["border", "border-border-default", "rounded-input"]),
    );
  });

  it("names the toggle the user turned on (usage tracking)", async () => {
    const own = [
      { viewMode: "ViewModesList", isOn: ref(true), iconOn: DamsIcons.ListUl, iconOff: DamsIcons.ListUl },
      { viewMode: "ViewModesGrid", isOn: ref(false), iconOn: DamsIcons.Apps, iconOff: DamsIcons.Apps },
    ];
    const wrapper = mount(BaseToggleGroup, {
      props: { toggles: own },
      global: {
        stubs: { unicon: true, BaseTooltip: { template: '<div><slot name="activator" :on="{}" /><slot /></div>' } },
        mocks: { $t: (key: string) => key },
      },
    });
    await wrapper.findAll("button")[1].trigger("click");
    expect(wrapper.emitted("selected")).toHaveLength(1);
    expect((wrapper.emitted("selected")![0][0] as { viewMode: string }).viewMode).toBe("ViewModesGrid");
  });

  it("says nothing when the page switches a toggle itself", async () => {
    const { wrapper, list, map } = getWrapper();
    list.value = false;
    map.value = true;
    await nextTick();
    expect(wrapper.emitted("selected")).toBeUndefined();
  });
});
