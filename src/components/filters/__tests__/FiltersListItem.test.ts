import { mount, shallowMount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import FiltersListItem from "@/components/filters/FiltersListItem.vue";
import FiltersListItemPanel from "@/components/filters/FiltersListItemPanel.vue";
import { Matchers, AdvancedFilterTypes } from "@/__mocks__/queries";

vi.mock("vue-i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("vue-router", () => ({
  useRoute: () => ({
    params: {
      id: 2,
    },
  }),
}));

vi.mock("@/composables/useBulkOperations", () => ({
  useBulkOperations: () => ({ dequeueItemForBulkProcessing: vi.fn() }),
  BulkOperationsContextEnum: { FilterOptions: "FilterOptions" },
}));

vi.mock("@/main", () => ({
  apolloClient: {
    query: vi.fn(),
    mutate: vi.fn(),
    watchQuery: vi.fn(),
  },
}));

describe("FiltersListItem Matcher Restriction", () => {
  it("correctly filters matchers based on allowedMatchers", async () => {
    const filter = {
      isActive: true,
      advancedFilter: {
        key: "test-filter",
        type: AdvancedFilterTypes.Text,
        label: "Test Label",
        allowedMatchers: [Matchers.ExactMatcher, Matchers.ContainsMatcher],
        defaultMatcher: Matchers.ExactMatcher,
      },
    };

    const mockMatchersProps = [
      { label: "Exact", value: Matchers.ExactMatcher },
      { label: "Contains", value: Matchers.ContainsMatcher },
      { label: "Between", value: Matchers.InBetweenMatcher },
      { label: "Any", value: Matchers.AnyMatcher },
    ];

    const wrapper = mount(FiltersListItem, {
      props: {
        filter,
        matchers: mockMatchersProps,
        clearAllActiveFilters: false,
        getNormalizedActiveFilters: () => ({}),
        refetchFilterOptions: false,
      },
    });

    const panel = wrapper.findComponent(FiltersListItemPanel);
    const passedMatchers = panel.props("matchers");

    expect(passedMatchers).toHaveLength(2);

    expect(passedMatchers).toEqual([
      { label: "Exact", value: Matchers.ExactMatcher },
      { label: "Contains", value: Matchers.ContainsMatcher },
    ]);

    const values = passedMatchers.map((m: any) => m.value);
    expect(values).not.toContain(Matchers.InBetweenMatcher);
    expect(values).not.toContain(Matchers.AnyMatcher);
  });

  it("correctly returns all matchers if allowedMatchers is not provided", async () => {
    const filter = {
      isActive: true,
      advancedFilter: {
        key: "test-filter",
        type: AdvancedFilterTypes.Text,
        label: "Test Label",
      },
    };

    const mockMatchersProps = [
      { label: "Exact", value: Matchers.ExactMatcher },
      { label: "Contains", value: Matchers.ContainsMatcher },
      { label: "Between", value: Matchers.InBetweenMatcher },
      { label: "Any", value: Matchers.AnyMatcher },
    ];

    const wrapper = mount(FiltersListItem, {
      props: {
        filter,
        matchers: mockMatchersProps,
        clearAllActiveFilters: false,
        getNormalizedActiveFilters: () => ({}),
        refetchFilterOptions: false,
      },
    });

    const panel = wrapper.findComponent(FiltersListItemPanel);
    const passedMatchers = panel.props("matchers");

    expect(passedMatchers).toHaveLength(4);

    expect(passedMatchers).toEqual(mockMatchersProps);

    const values = passedMatchers.map((m: any) => m.value);
    expect(values).toStrictEqual(mockMatchersProps.map((m) => m.value));
  });
});

describe("FiltersListItem - defaultMatcher Logic", () => {
  const mockMatchersProps = [
    { label: "Exact", value: Matchers.ExactMatcher },
    { label: "Contains", value: Matchers.ContainsMatcher },
  ];

  const defaultProps = {
    matchers: mockMatchersProps,
    clearAllActiveFilters: false,
    getNormalizedActiveFilters: () => ({}),
    refetchFilterOptions: false,
  };

  it("uses the explicit defaultMatcher if provided in advancedFilter", () => {
    const filter = {
      isActive: false,
      advancedFilter: {
        key: "test",
        type: AdvancedFilterTypes.Text,
        defaultMatcher: Matchers.ExactMatcher,
      },
    };

    const wrapper = mount(FiltersListItem, {
      props: { ...defaultProps, filter },
    });

    expect((wrapper.vm as any).selectedMatcher).toBe(Matchers.ExactMatcher);
  });

  it("falls back to the hardcoded map if no defaultMatcher is provided", () => {
    const filter = {
      isActive: false,
      advancedFilter: {
        key: "test",
        type: AdvancedFilterTypes.Text,
      },
    };

    const wrapper = mount(FiltersListItem, {
      props: { ...defaultProps, filter },
    });

    expect((wrapper.vm as any).selectedMatcher).toBe(Matchers.ContainsMatcher);
  });

  it("sets the selectedMatcher to ExactMatcher for Boolean types by default", () => {
    const filter = {
      isActive: false,
      advancedFilter: {
        key: "test",
        type: AdvancedFilterTypes.Boolean,
      },
    };

    const wrapper = mount(FiltersListItem, {
      props: { ...defaultProps, filter },
    });

    expect((wrapper.vm as any).selectedMatcher).toBe(Matchers.ExactMatcher);
  });

  it("prioritizes existing selectedMatcher from state over the default", () => {
    const filter = {
      isActive: true,
      selectedMatcher: Matchers.AnyMatcher,
      advancedFilter: {
        key: "test",
        type: AdvancedFilterTypes.Text,
        defaultMatcher: Matchers.ContainsMatcher,
      },
    };

    const wrapper = shallowMount(FiltersListItem, {
      props: { ...defaultProps, filter },
    });

    expect((wrapper.vm as any).selectedMatcher).toBe(Matchers.AnyMatcher);
  });
});
