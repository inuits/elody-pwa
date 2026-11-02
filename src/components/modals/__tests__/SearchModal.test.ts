import { describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { defineComponent, h, inject } from "vue";
import SearchModal from "@/components/modals/SearchModal.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));
vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({
    closeModal: vi.fn(),
    getModalInfo: () => ({ open: true }),
  }),
}));
// the results list pulls in the whole library stack; only the chrome is under test
vi.mock("@/components/library/BaseLibrary.vue", () => ({
  default: { name: "BaseLibrary", template: "<div />" },
}));
vi.mock("@/composables/useSimpleSearch", () => ({
  useSimpleSearch: () => ({
    buildFilters: (term: string) => [{ type: "text", value: term }],
  }),
}));

// renders what the library would read to decide on its own grey well and band
const LibraryProbe = defineComponent({
  name: "BaseLibrary",
  setup: () => {
    const insidePanel = inject("InsidePanel", false);
    return () => h("div", { "data-inside-panel": String(insidePanel) });
  },
});

const getWrapper = () =>
  shallowMount(SearchModal, {
    global: { renderStubDefaultSlot: true, stubs: { BaseLibrary: LibraryProbe } },
  });

describe("SearchModal", () => {
  it("titles the modal header (and so names the dialog) instead of a centred page heading", () => {
    const wrapper = getWrapper();
    expect(
      wrapper.findComponent({ name: "BaseModal" }).props("title"),
    ).toBe("search.simple-search");
    expect(wrapper.find("h1").exists()).toBe(false);
  });

  it("sits on the white surface", () => {
    const modal = getWrapper().findComponent({ name: "BaseModal" });
    expect(modal.classes()).toContain("bg-surface");
    expect(modal.classes()).not.toContain("bg-background-normal");
  });

  it("puts the results straight on the modal surface: the modal is the chrome (L25)", async () => {
    const wrapper = getWrapper();
    wrapper.findComponent({ name: "SearchBar" }).vm.$emit("search", "jo");
    await wrapper.vm.$nextTick();
    expect(wrapper.find("[data-inside-panel]").attributes("data-inside-panel")).toBe("true");
  });
});
