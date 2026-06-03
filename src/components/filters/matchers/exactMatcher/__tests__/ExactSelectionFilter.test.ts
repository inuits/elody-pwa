import { describe, it, expect, vi, beforeEach } from "vitest";
import { shallowMount, flushPromises } from "@vue/test-utils";
import {
  AdvancedFilterTypes,
  AutocompleteSelectionOptions,
} from "@/generated-types/queries";

const mocks = vi.hoisted(() => ({
  init: vi.fn().mockResolvedValue(undefined),
  setFilters: vi.fn().mockResolvedValue(undefined),
  getOptions: vi.fn().mockResolvedValue([]),
  loadOptionsAndFacetsInParallel: vi.fn().mockResolvedValue(undefined),
  setPredefinedOptions: vi.fn(),
  updateSelectedOptions: vi.fn(),
  options: { value: [] as any[] },
  loading: { value: false },
}));

vi.mock("@/composables/useFilterOptions", () => ({
  useFilterOptions: () => mocks,
}));
vi.mock("vue-router", () => ({
  useRoute: () => ({ meta: { entityType: "user" } }),
}));
vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

import ExactSelectionFilter from "../ExactSelectionFilter.vue";

const makeFilter = (overrides: any = {}) => ({
  advancedFilter: {
    type: AdvancedFilterTypes.Selection,
    entityType: "user",
    selectionOption: AutocompleteSelectionOptions.Checkboxlist,
    filterOptionsMapping: undefined,
    advancedFilterInputForRetrievingOptions: undefined,
    options: [],
    ...overrides,
  },
  inputFromState: { value: [] },
});

const getWrapper = (filter: any) =>
  shallowMount(ExactSelectionFilter, {
    props: {
      filter,
      lastTypedValue: "",
      isOpen: true,
      getNormalizedActiveFilters: () => [],
      refetchFilterOptions: false,
    },
    global: { stubs: { SpinnerLoader: true } },
  });

describe("ExactSelectionFilter with inline options", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.options.value = [];
  });

  it("uses predefined options and does not fetch", async () => {
    const filter = makeFilter({
      options: [
        { icon: "NoIcon", label: "metadata.labels.role", value: "admin" },
      ],
    });
    getWrapper(filter);
    await flushPromises();

    expect(mocks.setPredefinedOptions).toHaveBeenCalledWith(
      filter.advancedFilter.options,
    );
    expect(mocks.loadOptionsAndFacetsInParallel).not.toHaveBeenCalled();
    expect(mocks.getOptions).not.toHaveBeenCalled();
  });

  it("falls back to fetching when no inline options exist", async () => {
    const filter = makeFilter({
      options: [],
      advancedFilterInputForRetrievingOptions: [
        {
          type: AdvancedFilterTypes.Text,
          key: ["k"],
          value: "*",
          match_exact: false,
        },
      ],
    });
    getWrapper(filter);
    await flushPromises();

    expect(mocks.setPredefinedOptions).not.toHaveBeenCalled();
    expect(mocks.loadOptionsAndFacetsInParallel).toHaveBeenCalled();
  });
});
