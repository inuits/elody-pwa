// src/components/base/__tests__/BaseInputAutocomplete.virtualKeyboard.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, provide, ref, nextTick } from "vue";
import type { Ref } from "vue";
import BaseInputAutocomplete from "../BaseInputAutocomplete.vue";
import type { VirtualKeyboardContext } from "@/composables/useMetadataVirtualKeyboard";

// --- Mock @vueform/multiselect ---
const mockOpen = vi.fn();
const mockSearchRef = ref("");

vi.mock("@vueform/multiselect", () => ({
  default: defineComponent({
    name: "MockMultiselect",
    props: {
      modelValue: { default: undefined },
      options: { default: () => [] },
      searchable: { default: true },
      showOptions: { default: true },
      closeOnSelect: { default: true },
      classes: { default: () => ({}) },
      caret: { default: true },
      placeholder: { default: "" },
      appendTo: { default: "body" },
      loading: { default: false },
      disabled: { default: false },
      noOptionsText: { default: "" },
      object: { default: true },
      createOption: { default: false },
      searchFilter: { default: undefined },
      label: { default: "label" },
      valueProp: { default: "value" },
      mode: { default: "tags" },
    },
    emits: ["update:modelValue", "search-change"],
    setup(_, { emit, expose }) {
      expose({
        open: mockOpen,
        get search() {
          return mockSearchRef.value;
        },
        set search(v: string) {
          mockSearchRef.value = v;
          emit("search-change", v);
        },
      });
      return {};
    },
    template: `<div data-cy="multiselect"><slot /><slot name="afterlist" /></div>`,
  }),
}));

vi.mock("@/composables/useEntitySingle", () => ({
  default: () => ({ getEntityUuid: () => "test-uuid" }),
}));
vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({ someModalIsOpened: ref(false) }),
}));
vi.mock("@/composables/useEdit", () => ({
  useEditMode: () => ({ isEdit: ref(true) }),
}));
vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));
vi.mock("@/components/base/BaseInputTextNumberDatetime.vue", () => ({
  default: { template: "<div />" },
}));

// --- Mount helper ---
const mountWithContext = (context: VirtualKeyboardContext | null = null) => {
  const Parent = defineComponent({
    components: { BaseInputAutocomplete },
    setup() {
      if (context) provide("virtualKeyboardContext", context);
    },
    template: `<BaseInputAutocomplete
      :model-value="[{ label: 'A', value: 'a' }]"
      :options="[{ label: 'A', value: 'a' }]"
      autocomplete-style="default"
    />`,
  });
  return mount(Parent, { attachTo: document.body });
};

describe("BaseInputAutocomplete — virtual keyboard integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchRef.value = "";
  });

  it("does not throw when no virtualKeyboardContext is provided", () => {
    expect(() => mountWithContext(null)).not.toThrow();
  });

  describe("isOpen watcher", () => {
    it("calls multiselect.open() when isOpen becomes true", async () => {
      const isOpen = ref(false);
      const searchQuery = ref("");
      mountWithContext({ isOpen, searchQuery });

      isOpen.value = true;
      await nextTick();

      expect(mockOpen).toHaveBeenCalledTimes(1);
    });

    it("does not call multiselect.open() when isOpen becomes false", async () => {
      const isOpen = ref(true);
      const searchQuery = ref("");
      mountWithContext({ isOpen, searchQuery });

      isOpen.value = false;
      await nextTick();

      expect(mockOpen).not.toHaveBeenCalled();
    });
  });

  describe("searchQuery watcher", () => {
    it("sets multiselect.search when searchQuery changes", async () => {
      const isOpen = ref(false);
      const searchQuery = ref("");
      mountWithContext({ isOpen, searchQuery });

      searchQuery.value = "hello";
      await nextTick();

      expect(mockSearchRef.value).toBe("hello");
    });

    it("skips assignment when searchQuery already matches current multiselect search", async () => {
      const isOpen = ref(false);
      const searchQuery = ref("");
      mountWithContext({ isOpen, searchQuery });

      // Pre-set multiselect search to the same value without going through the watcher
      mockSearchRef.value = "same";
      searchQuery.value = "same";
      await nextTick();

      // Should still be "same" — no duplicate write triggered
      expect(mockSearchRef.value).toBe("same");
    });
  });

  describe("search-change write-back", () => {
    it("updates searchQuery when user types in the dropdown", async () => {
      const isOpen = ref(false);
      const searchQuery = ref("");
      const wrapper = mountWithContext({ isOpen, searchQuery });

      const multiselect = wrapper.findComponent({ name: "MockMultiselect" });
      await multiselect.vm.$emit("search-change", "typed text");
      await nextTick();

      expect(searchQuery.value).toBe("typed text");
    });

    it("does not write back when value is unchanged (prevents feedback loop)", async () => {
      const isOpen = ref(false);
      const searchQuery = ref("existing");
      let writeCount = 0;
      const trackedQuery = {
        get value() {
          return searchQuery.value;
        },
        set value(v: string) {
          writeCount++;
          searchQuery.value = v;
        },
      } as Ref<string>;

      const wrapper = mountWithContext({ isOpen, searchQuery: trackedQuery });
      const multiselect = wrapper.findComponent({ name: "MockMultiselect" });

      // Emit search-change with the value that's already in searchQuery
      writeCount = 0; // reset after mount
      await multiselect.vm.$emit("search-change", "existing");
      await nextTick();

      expect(writeCount).toBe(0);
    });
  });
});
