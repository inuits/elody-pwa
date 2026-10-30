import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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

describe("ExactSelectionFilter init call arguments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.options.value = [];
  });

  it("calls init with the entity type, filter options mapping, selected options and parent entity", async () => {
    const filterOptionsMapping = { label: "label.path", value: "value.path" };
    const filter = makeFilter({ filterOptionsMapping });
    filter.inputFromState = { value: ["existing-value"] };
    const parentEntity = { id: "parent-1" };

    shallowMount(ExactSelectionFilter, {
      props: {
        filter,
        lastTypedValue: "",
        isOpen: true,
        getNormalizedActiveFilters: () => [],
        refetchFilterOptions: false,
      },
      global: {
        stubs: { SpinnerLoader: true },
        provide: { ParentEntityProvider: parentEntity },
      },
    });
    await flushPromises();

    expect(mocks.init).toHaveBeenCalledWith({
      entityType: "user",
      filterOptionsMapping,
      selectedOptions: ["existing-value"],
      parentEntity,
    });
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

describe("ExactSelectionFilter search on a seeded text input", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.options.value = [];
  });

  const makeSeededFilter = (resolveDefaultValueToOptionIds: boolean) =>
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

  const search = async (wrapper: any, value: string) => {
    wrapper
      .findComponent({ name: "AutocompleteFilter" })
      .vm.$emit("searchOptions", value);
    await flushPromises();
    return mocks.setFilters.mock.calls.at(-1)![0];
  };

  it("searches on the typed text instead of the default seed value", async () => {
    mocks.options.value = [{ label: "Jef Geeraerts", value: "entities/1" }];
    const wrapper = getWrapper(makeSeededFilter(true));
    await flushPromises();

    const filters = await search(wrapper, "Claus");

    expect(filters[0].value).toBe("Claus");
    expect(filters[1].value).toEqual(["person", "corporation"]);
  });

  it("keeps a fixed text value when the input is not a resolvable default", async () => {
    mocks.options.value = [{ label: "Jef Geeraerts", value: "entities/1" }];
    const wrapper = getWrapper(makeSeededFilter(false));
    await flushPromises();

    const filters = await search(wrapper, "Claus");

    expect(filters[0].value).toBe("$entity.intialValues.primary_author_name");
  });
});

describe("ExactSelectionFilter seed resolution ranking", () => {
  const exactHits = [
    { label: "Nix, Garth", value: "entities/1" },
    { label: "Nix, Garth", value: "entities/2" },
  ];
  const rankedHits = [
    { label: "Nix, Garth", value: "entities/3" },
    { label: "Nix, Anna", value: "entities/4" },
  ];

  const respondWith = (exact: any[], contains: any[]) =>
    mocks.loadOptionsAndFacetsInParallel.mockImplementation(async () => {
      const inputs = mocks.setFilters.mock.calls.at(-1)![0];
      mocks.options.value = inputs[0].match_exact ? exact : contains;
    });

  const makeSeededFilter = (type = AdvancedFilterTypes.Text) =>
    makeFilter({
      selectionOption: AutocompleteSelectionOptions.Autocomplete,
      options: [],
      advancedFilterInputForRetrievingOptions: [
        {
          type,
          key: ["vlacc:1|properties.name.value"],
          value: "$entity.intialValues.primary_author_name",
          match_exact: false,
          resolveDefaultValueToOptionIds: true,
        },
        {
          type: AdvancedFilterTypes.Selection,
          key: "type",
          value: ["person", "corporation"],
        },
      ],
    });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.options.value = [];
  });

  afterEach(() => {
    mocks.loadOptionsAndFacetsInParallel.mockReset();
    mocks.loadOptionsAndFacetsInParallel.mockResolvedValue(undefined);
  });

  it("first searches the seed value as an exact match", async () => {
    respondWith(exactHits, rankedHits);
    getWrapper(makeSeededFilter());
    await flushPromises();

    const firstInputs = mocks.setFilters.mock.calls[0][0];
    expect(firstInputs[0].match_exact).toBe(true);
    expect(firstInputs[1]).toEqual({
      type: AdvancedFilterTypes.Selection,
      key: "type",
      value: ["person", "corporation"],
    });
  });

  it("fills every exact match and skips the contains search", async () => {
    respondWith(exactHits, rankedHits);
    const wrapper = getWrapper(makeSeededFilter());
    await flushPromises();

    expect(mocks.setFilters).toHaveBeenCalledTimes(1);
    expect(wrapper.emitted("updateValue")).toEqual([
      [["entities/1", "entities/2"]],
    ]);
  });

  it("falls back to the contains search and fills only the best ranked option", async () => {
    respondWith([], rankedHits);
    const wrapper = getWrapper(makeSeededFilter());
    await flushPromises();

    expect(mocks.setFilters).toHaveBeenCalledTimes(2);
    expect(mocks.setFilters.mock.calls[1][0][0].match_exact).toBe(false);
    expect(wrapper.emitted("updateValue")).toEqual([[["entities/3"]]]);
  });

  it("keeps filling every option for a flagged selection input", async () => {
    respondWith([], rankedHits);
    const wrapper = getWrapper(makeSeededFilter(AdvancedFilterTypes.Selection));
    await flushPromises();

    expect(mocks.setFilters).toHaveBeenCalledTimes(1);
    expect(mocks.setFilters.mock.calls[0][0][0].match_exact).toBe(false);
    expect(wrapper.emitted("updateValue")).toEqual([
      [["entities/3", "entities/4"]],
    ]);
  });
});
