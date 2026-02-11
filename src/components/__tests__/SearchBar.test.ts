import { mount } from "@vue/test-utils";
import SearchBar from "../SearchBar.vue";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { inject } from "vue";
import { AdvancedFilterTypes, Operator } from "@/generated-types/queries";

let testConfig: any;

// Override the global inject mock from vitestSetup.ts to provide SearchBar's config
vi.mock("vue", async (importOriginal) => {
  const actual = await importOriginal<typeof import("vue")>();
  return {
    ...actual,
    inject: (key: string) => {
      if (key === "config") return testConfig;
      return actual.inject(key);
    },
  };
});

vi.mock("@/types", () => ({
  Unicons: {
    SearchGlass: { name: "SearchGlass" },
  },
}));

vi.mock("@/composables/useBaseModal", () => ({
  useBaseModal: () => ({
    openModal: vi.fn(),
    getModalInfo: vi.fn(() => ({ open: false })),
  }),
}));

vi.mock("@/composables/useAdvancedSearch", () => ({
  useAdvancedSearch: () => ({
    getFiltersForAdvancedSearch: vi.fn(() => []),
  }),
}));

vi.mock("@/composables/usePermissions", () => ({
  usePermissions: () => ({
    can: vi.fn(() => true),
  }),
}));

describe("SearchBar", () => {
  beforeEach(() => {
    testConfig = {
      features: {
        simpleSearch: {
          simpleSearchMetadataKey: ["title"],
          clientKeyFormat: [],
          itemTypes: ["BaseEntity"],
        },
      },
    };
  });

  const createWrapper = () => {
    return mount(SearchBar, {
      props: { inputEnabled: true },
      global: {
        stubs: { unicon: true },
      },
    });
  };

  it("emits filters with match_all_words: true on enter", async () => {
    const wrapper = createWrapper();
    const input = wrapper.find("input");

    await input.setValue("herman brusselmans");
    await input.trigger("keydown.enter");

    const emitted = wrapper.emitted("updateFilters");
    expect(emitted).toBeTruthy();

    const filters = emitted![0][0] as any[];
    const textFilters = filters.filter(
      (f) => f.type === AdvancedFilterTypes.Text,
    );

    expect(textFilters.length).toBeGreaterThan(0);
    for (const filter of textFilters) {
      expect(filter.match_all_words).toBe(true);
      expect(filter.match_exact).toBe(false);
      expect(filter.operator).toBe(Operator.Or);
      expect(filter.value).toBe("herman brusselmans");
    }
  });

  it("emits filters with match_all_words for each metadata key", async () => {
    testConfig = {
      features: {
        simpleSearch: {
          simpleSearchMetadataKey: ["title", "description"],
          clientKeyFormat: [],
          itemTypes: [],
        },
      },
    };

    const wrapper = createWrapper();
    const input = wrapper.find("input");

    await input.setValue("test");
    await input.trigger("keydown.enter");

    const filters = wrapper.emitted("updateFilters")![0][0] as any[];
    const textFilters = filters.filter(
      (f) => f.type === AdvancedFilterTypes.Text,
    );

    expect(textFilters).toHaveLength(2);
    expect(textFilters[0].match_all_words).toBe(true);
    expect(textFilters[1].match_all_words).toBe(true);
  });

  it("includes type filters before text filters", async () => {
    const wrapper = createWrapper();
    const input = wrapper.find("input");

    await input.setValue("test");
    await input.trigger("keydown.enter");

    const filters = wrapper.emitted("updateFilters")![0][0] as any[];
    const typeFilters = filters.filter(
      (f) => f.type === AdvancedFilterTypes.Type,
    );
    const textFilters = filters.filter(
      (f) => f.type === AdvancedFilterTypes.Text,
    );

    expect(typeFilters.length).toBeGreaterThan(0);
    expect(textFilters.length).toBeGreaterThan(0);

    const lastTypeIndex = filters.lastIndexOf(
      typeFilters[typeFilters.length - 1],
    );
    const firstTextIndex = filters.indexOf(textFilters[0]);
    expect(lastTypeIndex).toBeLessThan(firstTextIndex);
  });
});
