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

const getWrapper = (filter: any, isOpen = true) =>
  shallowMount(ExactSelectionFilter, {
    props: {
      filter,
      lastTypedValue: "",
      isOpen,
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

describe("ExactSelectionFilter resolveDefaultValueToOptionIds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.options.value = [];
  });

  const makeAutocompleteFilter = (resolveDefaultValueToOptionIds: boolean) =>
    makeFilter({
      selectionOption: AutocompleteSelectionOptions.Autocomplete,
      options: [],
      advancedFilterInputForRetrievingOptions: [
        {
          type: AdvancedFilterTypes.Text,
          key: ["vlacc:1|properties.name.value"],
          value: "$entity.intialValues.primary_author_name",
          match_exact: false,
          resolveDefaultValueToOptionIds,
        },
        {
          type: AdvancedFilterTypes.Selection,
          key: "type",
          value: ["person", "corporation"],
        },
      ],
    });

  it("auto-fills the parent filter with all fetched option ids when flagged", async () => {
    mocks.options.value = [
      { label: "Jef Geeraerts", value: "entities/1" },
      { label: "Jef Geeraerts", value: "entities/2" },
    ];
    const wrapper = getWrapper(makeAutocompleteFilter(true));
    await flushPromises();

    const emitted = wrapper.emitted("updateValue");
    expect(emitted).toBeTruthy();
    expect(emitted![0]).toEqual([["entities/1", "entities/2"]]);
  });

  it("auto-fills even when the filter panel is not opened", async () => {
    mocks.options.value = [{ label: "Jef Geeraerts", value: "entities/1" }];
    const wrapper = getWrapper(makeAutocompleteFilter(true), false);
    await flushPromises();

    expect(mocks.loadOptionsAndFacetsInParallel).toHaveBeenCalled();
    expect(wrapper.emitted("updateValue")![0]).toEqual([["entities/1"]]);
  });

  it("does not fetch on mount for an unflagged closed filter", async () => {
    mocks.options.value = [{ label: "Jef Geeraerts", value: "entities/1" }];
    const wrapper = getWrapper(makeAutocompleteFilter(false), false);
    await flushPromises();

    expect(mocks.loadOptionsAndFacetsInParallel).not.toHaveBeenCalled();
    expect(wrapper.emitted("updateValue")).toBeFalsy();
  });

  it("does not auto-fill when the flag is absent", async () => {
    mocks.options.value = [{ label: "Jef Geeraerts", value: "entities/1" }];
    const wrapper = getWrapper(makeAutocompleteFilter(false));
    await flushPromises();

    expect(wrapper.emitted("updateValue")).toBeFalsy();
  });

  it("does not emit when flagged but no options are returned", async () => {
    mocks.options.value = [];
    const wrapper = getWrapper(makeAutocompleteFilter(true));
    await flushPromises();

    expect(wrapper.emitted("updateValue")).toBeFalsy();
  });

  it("auto-fills only once and not again on a subsequent option load", async () => {
    mocks.options.value = [{ label: "Jef Geeraerts", value: "entities/1" }];
    const filter = makeAutocompleteFilter(true);
    // Facets make the refetch watcher trigger a second loadOptions.
    filter.advancedFilter.facets = [{ key: "type", type: "type", value: "x" }];
    const wrapper = getWrapper(filter);
    await flushPromises();

    expect(wrapper.emitted("updateValue")!.length).toBe(1);

    // Simulate a re-fetch (e.g. a facet refetch) returning different options.
    mocks.options.value = [{ label: "Someone Else", value: "entities/9" }];
    await wrapper.setProps({ refetchFilterOptions: true });
    await flushPromises();

    expect(wrapper.emitted("updateValue")!.length).toBe(1);
  });
});
