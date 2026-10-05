import { describe, it, expect, vi } from "vitest";
import { mount, shallowMount } from "@vue/test-utils";
import AdvancedDropdown from "@/components/base/AdvancedDropdown.vue";

vi.mock("vue-router", () => ({
  useRoute: () => ({ params: {} }),
}));

vi.mock("@/composables/useEdit", () => ({
  useEditMode: () => ({ isEdit: { value: false } }),
}));

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({ someModalIsOpened: { value: false } }),
}));

vi.mock("@/composables/useModalTeleportTarget", () => ({
  modalTeleportTarget: () => "body",
}));

vi.mock("@/generated-types/queries", () => ({
  ActionContextEntitiesSelectionType: {},
  ActionContextViewModeTypes: {},
  SanitizeMode: { Html: "html" },
}));

vi.mock("@/helpers", () => ({
  stripHighlightTags: (value: string) => value,
}));

vi.mock("@/components/SanitizedHtml.vue", () => ({
  default: { name: "SanitizedHtml", template: "<span />" },
}));

vi.mock("vue3-select-component", () => ({
  default: {
    name: "VueSelect",
    props: ["classes"],
    template: `<div><slot name="tag" :option="{ label: 'Monografie', value: 'monograph' }" /></div>`,
  },
}));

const getSelect = (props: Record<string, unknown> = {}) =>
  shallowMount(AdvancedDropdown, {
    props: {
      modelValue: undefined,
      options: [{ label: "Monografie", value: "monograph" }],
      ...props,
    },
  }).findComponent({ name: "VueSelect" });

describe("AdvancedDropdown", () => {
  it("shapes the trigger like an input", () => {
    expect(getSelect().classes()).toContain("!rounded-input");
  });

  it("renders the trigger value at the value text size", () => {
    expect(getSelect().classes()).toContain("text-value");
  });

  it("floats the menu as an overlay with the card radius", () => {
    const menu = getSelect().props("classes").menuContainer;
    expect(menu).toContain("shadow-overlay");
    expect(menu).toContain("rounded-card");
  });

  it("borders the menu with the subtle border token", () => {
    expect(getSelect().props("classes").menuContainer).toContain(
      "border-border-subtle",
    );
  });
});

describe("AdvancedDropdown — selected-value chips", () => {
  const tag = () =>
    mount(AdvancedDropdown, {
      global: { stubs: { unicon: true } },
      props: {
        modelValue: ["monograph"],
        options: [{ label: "Monografie", value: "monograph" }],
        multiple: true,
      },
    });

  it("renders as a relation chip with the chip tokens", () => {
    const chip = tag().find('[data-cy="dropdown-chip"]');
    expect(chip.classes()).toEqual(
      expect.arrayContaining(["rounded-chip", "bg-chip-relation-bg"]),
    );
    expect(chip.find("div").classes()).toEqual(
      expect.arrayContaining(["text-chip", "font-bold", "p-(--chip-padding)"]),
    );
  });

  it("names the remove button as a removal", () => {
    expect(tag().find("button").attributes("aria-label")).toBe(
      "Remove Monografie",
    );
  });

  it("hovers the remove button with a body-ink wash", () => {
    expect(tag().find("button").classes()).toContain("hover:bg-text-body/10");
  });
});
