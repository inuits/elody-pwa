import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import AdvancedDropdown from "../AdvancedDropdown.vue";

vi.mock("vue-i18n", () => ({ useI18n: () => ({ t: (k: string) => k }) }));
vi.mock("vue-router", () => ({ useRoute: () => ({ params: { id: "e1" } }) }));
vi.mock("@/composables/useEdit", () => ({
  useEditMode: () => ({ isEdit: { value: false } }),
}));
vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({ someModalIsOpened: { value: false } }),
}));

/** Stands in for vue3-select-component so the props it receives are visible. */
const { VueSelectStub } = vi.hoisted(() => ({
  VueSelectStub: {
    name: "VueSelect",
    props: [
      "modelValue",
      "options",
      "placeholder",
      "isDisabled",
      "isMulti",
      "isClearable",
      "isSearchable",
      "closeOnSelect",
      "shouldAutofocusOption",
      "teleport",
      "classes",
    ],
    template: "<div class='vue-select-stub' />",
  },
}));

vi.mock("vue3-select-component", () => ({ default: VueSelectStub }));

const optionsOfLength = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    label: `option-${index}`,
    value: `option-${index}`,
  }));

const getSelect = (props: Record<string, unknown>) =>
  mount(AdvancedDropdown, {
    props: { modelValue: undefined, options: [], ...props },
  }).findComponent({ name: "VueSelect" });

describe("AdvancedDropdown", () => {
  describe("search in list", () => {
    it("offers search once the list passes ten options", () => {
      const select = getSelect({ options: optionsOfLength(11) });
      expect(select.props("isSearchable")).toBe(true);
    });

    it("leaves search off for a list short enough to read at a glance", () => {
      const select = getSelect({ options: optionsOfLength(10) });
      expect(select.props("isSearchable")).toBe(false);
    });
  });

  describe("multi select", () => {
    it("keeps the popup open while picking several values", () => {
      const select = getSelect({ options: optionsOfLength(3), multiple: true });
      expect(select.props("closeOnSelect")).toBe(false);
    });

    it("closes on pick for a single select", () => {
      const select = getSelect({ options: optionsOfLength(3) });
      expect(select.props("closeOnSelect")).toBe(true);
    });
  });
});
