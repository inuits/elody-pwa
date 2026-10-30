import { describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
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
  useSimpleSearch: () => ({ buildFilters: () => [] }),
}));

const getWrapper = () =>
  shallowMount(SearchModal, {
    global: { renderStubDefaultSlot: true },
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
});
