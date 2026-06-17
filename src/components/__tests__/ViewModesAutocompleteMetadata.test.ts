import { describe, it, expect, vi } from "vitest";

vi.mock("@/main", () => ({
  i18n: {
    global: {
      t: (key: string) => key,
    },
  },
  typeUrlMapping: {
    mapping: {},
    reverseMapping: {},
  },
}));

import { mount } from "@vue/test-utils";
import ViewModesAutocompleteMetadata from "@/components/library/view-modes/ViewModesAutocompleteMetadata.vue";
import { DamsIcons } from "@/generated-types/queries";

const baseOptions = [
  { icon: DamsIcons.NoIcon, label: "Admin", value: "venue_admin" },
  { icon: DamsIcons.NoIcon, label: "Member", value: "venue_member" },
];

const mountComponent = (
  modelValue: string | string[] | undefined,
  selectType: "single" | "multi" = "multi",
) =>
  mount(ViewModesAutocompleteMetadata, {
    props: {
      modelValue,
      metadataDropdownOptions: baseOptions,
      selectType,
      mode: "edit",
    },
    global: {
      stubs: { BaseInputAutocomplete: true },
    },
  });

const emitFromAutocomplete = async (
  wrapper: ReturnType<typeof mountComponent>,
  value: any,
) => {
  await wrapper
    .findComponent({ name: "BaseInputAutocomplete" })
    .vm.$emit("update:modelValue", value);
};

describe("ViewModesAutocompleteMetadata — multi-select setter", () => {
  it("emits [] when multi-select receives empty array", async () => {
    const wrapper = mountComponent(["venue_admin"], "multi");
    await emitFromAutocomplete(wrapper, []);
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([[]]);
  });

  it("emits [] when multi-select receives undefined", async () => {
    const wrapper = mountComponent(["venue_admin"], "multi");
    await emitFromAutocomplete(wrapper, undefined);
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([[]]);
  });

  it("emits mapped values when multi-select receives options", async () => {
    const wrapper = mountComponent([], "multi");
    await emitFromAutocomplete(wrapper, [
      { value: "venue_admin", label: "Admin" },
      { value: "venue_member", label: "Member" },
    ]);
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([
      ["venue_admin", "venue_member"],
    ]);
  });

  it("emits \"\" when single-select is cleared", async () => {
    const wrapper = mountComponent("venue_admin", "single");
    await emitFromAutocomplete(wrapper, []);
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual([""]);
  });

  it("emits the value when single-select has a selection", async () => {
    const wrapper = mountComponent("", "single");
    await emitFromAutocomplete(wrapper, [
      { value: "venue_admin", label: "Admin" },
    ]);
    expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["venue_admin"]);
  });
});
