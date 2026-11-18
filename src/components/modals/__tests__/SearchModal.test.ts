import { beforeEach, describe, it, expect, vi } from "vitest";
import { shallowMount } from "@vue/test-utils";
import { defineComponent, h, inject, ref } from "vue";
import SearchModal from "@/components/modals/SearchModal.vue";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    t: (key: string, values?: unknown) =>
      typeof values === "object" ? `${key} ${JSON.stringify(values)}` : key,
  }),
}));
const customization = vi.hoisted(
  () => ({}) as { applicationTitle?: string },
);
vi.mock("vue", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue")>();
  return {
    ...actual,
    inject: (key: string, ...rest: unknown[]) =>
      key === "config"
        ? { features: {}, customization }
        : (actual.inject as (...args: unknown[]) => unknown)(key, ...rest),
  };
});
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
const buildFilters = vi.fn((term: string, types?: string[]) => [
  { type: "text", value: term, types },
]);
const itemTypes = ref<string[]>(["production", "mediafile"]);
vi.mock("@/composables/useSimpleSearch", () => ({
  useSimpleSearch: () => ({ buildFilters, itemTypes }),
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
    ).toBe('search.simple-search {"applicationTitle":"Elody"}');
    expect(wrapper.find("h1").exists()).toBe(false);
  });

  it("names the client's application title in the modal header", () => {
    customization.applicationTitle = "Podiumnet";
    const wrapper = getWrapper();
    expect(
      wrapper.findComponent({ name: "BaseModal" }).props("title"),
    ).toBe('search.simple-search {"applicationTitle":"Podiumnet"}');
    delete customization.applicationTitle;
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

  describe("initial state (3a)", () => {
    beforeEach(() => {
      buildFilters.mockClear();
      itemTypes.value = ["production", "mediafile"];
    });

    const chips = (wrapper: ReturnType<typeof getWrapper>) =>
      wrapper.findAll("[data-testid='search-scope-chip']");

    it("sizes to its content and opens near the top instead of a fixed 70vh", () => {
      const classes = getWrapper().findComponent({ name: "BaseModal" }).classes();
      expect(classes).not.toContain("h-[70vh]");
      expect(classes).toContain("md:mt-[10vh]");
    });

    it("names every searchable type as a pressed scope chip", () => {
      const found = chips(getWrapper());
      expect(found.map((chip) => chip.text())).toEqual([
        "entity-translations.production",
        "entity-translations.mediafile",
      ]);
      expect(found.every((chip) => chip.attributes("aria-pressed") === "true")).toBe(true);
    });

    it("hides the chips when there is nothing to choose between", () => {
      itemTypes.value = ["production"];
      expect(chips(getWrapper())).toHaveLength(0);
    });

    it("re-runs the current search with the narrowed scope", async () => {
      const wrapper = getWrapper();
      wrapper.findComponent({ name: "SearchBar" }).vm.$emit("search", "kerff");
      await chips(wrapper)[1].trigger("click");
      expect(chips(wrapper)[1].attributes("aria-pressed")).toBe("false");
      expect(buildFilters).toHaveBeenLastCalledWith("kerff", ["production"]);
    });

    it("never lets the last type be switched off", async () => {
      const wrapper = getWrapper();
      await chips(wrapper)[1].trigger("click");
      await chips(wrapper)[0].trigger("click");
      expect(chips(wrapper)[0].attributes("aria-pressed")).toBe("true");
    });

    it("says in the footer how much of the scope is active", async () => {
      const wrapper = getWrapper();
      const footer = () => wrapper.find("[data-testid='search-footer']").text();
      expect(footer()).toContain("search.all-types");
      await chips(wrapper)[1].trigger("click");
      expect(footer()).toContain('search.types-active {"active":1,"total":2}');
    });
  });
});
