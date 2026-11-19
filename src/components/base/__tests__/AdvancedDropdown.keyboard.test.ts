import { describe, it, expect, vi, afterEach } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import AdvancedDropdown from "@/components/base/AdvancedDropdown.vue";

vi.mock("vue-router", () => ({ useRoute: () => ({ params: {} }) }));
vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key.replace("labels.", "Translated "),
    te: () => false,
  }),
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
vi.mock("@/components/SanitizedHtml.vue", () => ({
  default: {
    name: "SanitizedHtml",
    props: ["content"],
    template: "<span>{{ content }}</span>",
  },
}));

const options = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    label: `Option ${i + 1}`,
    value: `option-${i + 1}`,
  }));

let wrapper: VueWrapper | undefined;
const mountDropdown = (count: number, extra: Record<string, unknown> = {}) => {
  wrapper = mount(AdvancedDropdown, {
    attachTo: document.body,
    props: {
      modelValue: undefined,
      options: options(count),
      clearable: false,
      ...extra,
    },
    global: { stubs: { unicon: true } },
  });
  return wrapper.find<HTMLInputElement>("input.search-input");
};

afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

describe("AdvancedDropdown keyboard access", () => {
  it("can be reached with Tab when the list is short and has no search", () => {
    const input = mountDropdown(3);
    expect(input.attributes("tabindex")).toBe("0");
    expect(input.attributes("aria-hidden")).toBeUndefined();
  });

  it("stays read-only when the list is short, so typing doesn't filter", () => {
    const input = mountDropdown(3);
    expect(input.element.readOnly).toBe(true);
  });

  it("opens with Space and picks with Enter", async () => {
    const input = mountDropdown(3);
    await input.trigger("keydown", { code: "Space", key: " " });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    await wrapper!.vm.$nextTick();

    const emitted = wrapper!.emitted("update:modelValue") ?? [];
    expect(emitted.at(-1)?.[0]).toBe("option-1");
  });

  it("stays searchable and reachable when the list is long", () => {
    const input = mountDropdown(12);
    expect(input.attributes("tabindex")).toBe("0");
    expect(input.element.readOnly).toBe(false);
  });

  it("is named by the field label it is given", () => {
    mountDropdown(3, { labelledBy: "field-label-1" });
    expect(
      wrapper!.find('[role="combobox"]').attributes("aria-labelledby"),
    ).toBe("field-label-1");
  });

  it("names the focusable input by the field label and then the value", async () => {
    const input = mountDropdown(3, { labelledBy: "field-label-1" });
    await wrapper!.vm.$nextTick();
    const combobox = wrapper!.find('[role="combobox"]');
    expect(input.attributes("aria-labelledby")).toBe(
      `field-label-1 ${combobox.attributes("id")}`,
    );
  });

  it("points each input at its own value, not another dropdown's", async () => {
    wrapper = mount(
      {
        components: { AdvancedDropdown },
        setup: () => ({ opts: options(3) }),
        template: `
          <AdvancedDropdown :model-value="undefined" :options="opts" :clearable="false" labelled-by="label-a" />
          <AdvancedDropdown :model-value="undefined" :options="opts" :clearable="false" labelled-by="label-b" />`,
      },
      { attachTo: document.body, global: { stubs: { unicon: true } } },
    );
    await wrapper.vm.$nextTick();

    const valueIds = wrapper
      .findAll("input.search-input")
      .map((input) => input.attributes("aria-labelledby")!.split(" ")[1]);
    expect(valueIds[0]).not.toBe(valueIds[1]);
    valueIds.forEach((id) =>
      expect(document.querySelectorAll(`#${id}`)).toHaveLength(1),
    );
  });

  it("keeps focus on the field after an option is picked", async () => {
    const input = mountDropdown(3);
    (input.element as HTMLInputElement).focus();
    await input.trigger("keydown", { code: "Space", key: " " });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    await new Promise((resolve) => setTimeout(resolve));

    expect(document.activeElement).toBe(input.element);
  });

  it("announces the translated value, not the translation key", async () => {
    wrapper = mount(AdvancedDropdown, {
      attachTo: document.body,
      props: {
        modelValue: "a",
        options: [{ label: "labels.closed", value: "a" }],
        clearable: false,
      },
      global: { stubs: { unicon: true } },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[role="combobox"]').attributes("aria-label")).toBe(
      "Translated closed",
    );
  });
});
