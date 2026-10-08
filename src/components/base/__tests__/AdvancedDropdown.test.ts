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
    props: [
      "classes",
      "options",
      "isSearchable",
      "isLoading",
      "isMulti",
      "closeOnSelect",
      "hideSelectedOptions",
    ],
    template: `<div>
      <slot name="tag" :option="{ label: 'Monografie', value: 'monograph' }" />
      <slot name="tag" :option="{ label: 'Tijdschrift', value: 'journal' }" />
      <div v-for="(option, index) in options" :key="option.value" data-cy="option">
        <component :is="$slots.option" v-if="$slots.option" v-bind="{ option, index, 'is-selected': option.value === 'monograph', 'is-focused': false, 'is-disabled': false }" />
      </div>
      <div data-cy="no-options"><slot name="no-options" /></div>
    </div>`,
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

const options = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ label: `Optie ${i}`, value: `o${i}` }));

const mountDropdown = (props: Record<string, unknown> = {}) =>
  mount(AdvancedDropdown, {
    props: { modelValue: undefined, options: options(3), ...props },
    global: { stubs: { unicon: true } },
  });

const select = (props: Record<string, unknown> = {}) =>
  mountDropdown(props).findComponent({ name: "VueSelect" });

describe("AdvancedDropdown — search", () => {
  it("offers search above ten options", () => {
    expect(select({ options: options(11) }).props("isSearchable")).toBe(true);
  });

  it("hides search for ten options or fewer", () => {
    expect(select({ options: options(10) }).props("isSearchable")).toBe(false);
  });
});

describe("AdvancedDropdown — empty choice", () => {
  it("starts a non-required single select with the empty-value option", () => {
    const first = select().props("options")[0];
    expect(first.label).toBe("No value");
  });

  it("has no empty-value option when a value is required", () => {
    expect(select({ clearable: false }).props("options")).toHaveLength(3);
  });

  it("has no empty-value option in a multi select", () => {
    expect(select({ multiple: true }).props("options")).toHaveLength(3);
  });

  it("clears the value when the empty-value option is picked", async () => {
    const wrapper = mountDropdown({ modelValue: "o1" });
    const vueSelect = wrapper.findComponent({ name: "VueSelect" });
    const none = vueSelect.props("options")[0].value;
    await vueSelect.vm.$emit("update:modelValue", none);
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([""]);
  });
});

describe("AdvancedDropdown — loading and empty", () => {
  it("shows three option-shaped skeletons while loading", () => {
    const skeletons = mountDropdown({ loading: true, options: [] }).findAll(
      '[data-cy="option-skeleton"]',
    );
    expect(skeletons).toHaveLength(3);
  });

  it("marks itself busy while loading", () => {
    expect(
      mountDropdown({ loading: true }).find('[data-cy="base-dropdown-new"]').attributes("aria-busy"),
    ).toBe("true");
  });

  it("says there are no options when the list is empty", () => {
    expect(
      mountDropdown({ options: [] }).find('[data-cy="no-options"]').text(),
    ).toBe("No options");
  });
});

describe("AdvancedDropdown — multi select", () => {
  const multi = () =>
    mountDropdown({ multiple: true, modelValue: ["monograph", "journal"] });

  it("summarises the selection as a count in the trigger", () => {
    const counts = multi().findAll('[data-cy="dropdown-count"]');
    expect(counts).toHaveLength(1);
    expect(counts[0].text()).toBe("2 selected");
  });

  it("renders a checkbox in each option", () => {
    expect(multi().findAll('[data-cy="option"] input[type="checkbox"]')).toHaveLength(3);
  });

  it("checks the boxes of the selected options", () => {
    const boxes = mountDropdown({
      multiple: true,
      options: [
        { label: "Monografie", value: "monograph" },
        { label: "Tijdschrift", value: "journal" },
        { label: "Boek", value: "book" },
      ],
      modelValue: ["monograph", "book"],
    })
      .findAll('[data-cy="option"] input[type="checkbox"]')
      .map((box) => (box.element as HTMLInputElement).checked);
    expect(boxes).toEqual([true, false, true]);
  });

  it("keeps the menu open and the selected options listed", () => {
    const vueSelect = multi().findComponent({ name: "VueSelect" });
    expect(vueSelect.props("closeOnSelect")).toBe(false);
    expect(vueSelect.props("hideSelectedOptions")).toBe(false);
  });
});

describe("AdvancedDropdown — selected option", () => {
  it("marks the selected option with a check", () => {
    const optionEls = mountDropdown({
      options: [
        { label: "Monografie", value: "monograph" },
        { label: "Tijdschrift", value: "journal" },
      ],
      modelValue: "journal",
      clearable: false,
    }).findAll('[data-cy="option"]');
    expect(optionEls[0].find('[data-cy="option-check"]').exists()).toBe(false);
    expect(optionEls[1].find('[data-cy="option-check"]').exists()).toBe(true);
  });
});
