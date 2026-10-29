import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import MapFeaturePopUp from "../MapFeaturePopUp.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));
vi.mock("@/composables/useEmptyValueLabel", () => ({
  useEmptyValueLabel: () => "No value",
}));

const entity = {
  id: "AICAP0001",
  type: "sites",
  intialValues: { name: "Amarat Jilah", square: "" },
};
const configuration = [
  { key: "name", label: "metadata.labels.name" },
  { key: "square", label: "metadata.labels.square" },
];

const getWrapper = () =>
  mount(MapFeaturePopUp, {
    props: { entity, configuration, loading: false },
    global: { stubs: { RouterLink: { template: "<a><slot /></a>" }, unicon: true, SpinnerLoader: true } },
  });

describe("MapFeaturePopUp", () => {
  it("is a dialog named by the feature's first value", () => {
    const dialog = getWrapper().find('[role="dialog"]');
    expect(dialog.attributes("aria-label")).toBe("Amarat Jilah");
  });

  it("shows each configured value, or the empty label", () => {
    const text = getWrapper().text();
    expect(text).toContain("Amarat Jilah");
    expect(text).toContain("No value");
  });

  it("closes from its named close button", async () => {
    const wrapper = getWrapper();
    await wrapper.find('[aria-label="actions.labels.close"]').trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("closes on Escape", async () => {
    const wrapper = getWrapper();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("links to the record with a translated label", () => {
    expect(getWrapper().text()).toContain("map.open-in-new-tab");
  });
});
