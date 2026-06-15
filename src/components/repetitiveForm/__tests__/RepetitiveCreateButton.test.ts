import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import RepetitiveCreateButton from "@/components/repetitiveForm/RepetitiveCreateButton.vue";
import BaseContextMenuItem from "@/components/base/BaseContextMenuItem.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const types = [
  {
    label: "entity-translations.singular.work_word",
    entityType: "work_word",
    createForm: "GetFullWorkWordCreateForm",
  },
  {
    label: "entity-translations.singular.work_serial",
    entityType: "work_serial",
    createForm: "GetFullWorkSerialCreateForm",
  },
];

const getWrapper = (props: any) =>
  mount(RepetitiveCreateButton, {
    props,
    global: { mocks: { $t: (k: string) => k } },
  });

const button = (w: ReturnType<typeof getWrapper>) =>
  w.find("[data-testid='repetitive-step-create-new']");

describe("RepetitiveCreateButton", () => {
  it("selects the single creatable type immediately, without a dropdown", async () => {
    const wrapper = getWrapper({ types: [types[0]] });
    await button(wrapper).trigger("click");
    expect(wrapper.emitted("select")?.[0]).toEqual([types[0]]);
    expect(wrapper.findAllComponents(BaseContextMenuItem)).toHaveLength(0);
  });

  it("opens a dropdown with one option per type and emits the chosen type", async () => {
    const wrapper = getWrapper({ types });
    await button(wrapper).trigger("click");
    // clicking the button opens the dropdown rather than selecting
    expect(wrapper.emitted("select")).toBeFalsy();
    const options = wrapper.findAllComponents(BaseContextMenuItem);
    expect(options).toHaveLength(2);

    options[1].vm.$emit("clicked");
    await wrapper.vm.$nextTick();
    expect(wrapper.emitted("select")?.[0]).toEqual([types[1]]);
  });
});
