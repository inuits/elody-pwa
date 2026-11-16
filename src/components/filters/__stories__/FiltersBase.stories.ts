import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onBeforeUnmount, onMounted, provide } from "vue";
import { useSaveSearchHepler } from "@/composables/useSaveSearchHepler";
import FiltersBase from "../FiltersBase.vue";
import FiltersPane from "../FiltersPane.vue";
import { registerQueryFixture } from "@/main";
import { Entitytyping } from "@/generated-types/queries";

/**
 * The rail fetches its filter definitions and the matcher mapping on mount;
 * both resolve against these fixtures through mockMain's fixture link, so
 * the story renders the real request flow without a backend.
 */
const advancedFilter = (overrides: Record<string, unknown>) => ({
  __typename: "AdvancedFilter",
  operator: null,
  selectionOption: null,
  isDisplayedByDefault: true,
  defaultMatcher: null,
  allowedMatchers: null,
  options: null,
  filterOptionsMapping: null,
  limitConfig: null,
  useOldWayToFetchOptions: null,
  advancedFilterInputForRetrievingOptions: null,
  aggregation: null,
  bucket: null,
  context: null,
  defaultValueMapping: null,
  distinctBy: null,
  doNotOverrideDefaultValue: null,
  entityType: null,
  facets: null,
  hidden: false,
  includeDefaultValuesFromIntialValues: null,
  itemTypes: null,
  lookup: null,
  matchExact: null,
  matcherLabels: null,
  matchersType: null,
  metadataKeyAsLabel: null,
  parentKey: null,
  relationKey: null,
  selectionsOnly: null,
  showTimeForDateFilter: null,
  tooltip: null,
  unit: null,
  ...overrides,
});

const registerFixtures = () => {
  registerQueryFixture("GetFilterMatcherMapping", {
    FilterMatcherMapping: [
      {
        __typename: "FilterMatchers",
        key: "text",
        matchers: ["ContainsMatcher", "ExactMatcher", "NoneMatcher", "AnyMatcher"],
      },
      {
        __typename: "FilterMatchers",
        key: "selection",
        matchers: ["ExactMatcher", "NoneMatcher", "AnyMatcher"],
      },
      {
        __typename: "FilterMatchers",
        key: "date",
        matchers: ["MinIncludedMatcher", "MaxIncludedMatcher", "InBetweenMatcher"],
      },
      { __typename: "FilterMatchers", key: "number", matchers: ["ExactMatcher"] },
      { __typename: "FilterMatchers", key: "boolean", matchers: ["ExactMatcher"] },
      { __typename: "FilterMatchers", key: "type", matchers: ["ExactMatcher"] },
    ],
  });

  registerQueryFixture("getAdvancedFilters", {
    EntityTypeFilters: {
      __typename: "Manifestation",
      advancedFilters: {
        __typename: "AdvancedFilters",
        title: advancedFilter({
          type: "text",
          key: ["title"],
          label: "Title",
        }),
        genre: advancedFilter({
          type: "selection",
          key: ["genre"],
          label: "Genre",
          selectionOption: "checkboxlist",
          options: [
            { __typename: "DropdownOption", icon: null, label: "adventure", value: "adventure" },
            { __typename: "DropdownOption", icon: null, label: "fantasy", value: "fantasy" },
            { __typename: "DropdownOption", icon: null, label: "fairy tale", value: "fairy-tale" },
          ],
        }),
        publication_year: advancedFilter({
          type: "date",
          key: ["publication_year"],
          label: "Year of publication",
        }),
        language: advancedFilter({
          type: "text",
          key: ["language"],
          label: "Language",
          isDisplayedByDefault: false,
        }),
      },
    },
  });
};

const routeFixture = {
  name: "Home",
  path: "/story/filters",
  fullPath: "/story/filters",
  params: {},
  query: {},
  hash: "",
  matched: [],
  meta: {},
  redirectedFrom: undefined,
} as never;

const meta: Meta<typeof FiltersBase> = {
  // Story id filters-filtersbase--default, embedded by filter-panel.md.
  title: "Filters/FiltersBase",
  component: FiltersBase,
  parameters: {
    docs: {
      description: {
        component:
          "The filter rail: sections per filter with the active count in " +
          "the header, matcher chrome per type, per-section Clear filter and " +
          "the shared Search commit. Definitions come from the entity type's " +
          "filter query; here they resolve from story fixtures.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FiltersBase>;

const withConfig = (savedSearch: boolean) => () => ({
  setup() {
    provide("config", {
      features: { savedSearch: { enabled: savedSearch } },
    });
  },
  template: "<story />",
});

const renderRail = (savedSearch: boolean) => () => ({
  components: { FiltersBase, FiltersPane },
  setup() {
    registerFixtures();
    if (savedSearch) {
      registerQueryFixture("getEntities", {
        Entities: { __typename: "EntitiesResults", count: 0, limit: 20, facets: [], results: [] },
      });
      const helper = useSaveSearchHepler();
      helper.addNewSavedFilterToLastUsedFiltersForRoute(routeFixture, {
        id: "ss-2",
        title: "Awaiting review",
        value: [],
      });
      onMounted(() =>
        setTimeout(
          () =>
            helper.setActiveFilter({
              id: "ss-1",
              title: "Comics published after 2000",
              value: [],
            }),
          200,
        ),
      );
      onBeforeUnmount(() => helper.setActiveFilter(null));
    }
    return {
      route: routeFixture,
      entityType: Entitytyping.BaseEntity,
      savedSearch,
      noop: () => undefined,
    };
  },
  template: `
    <div style="display:flex;height:420px;max-width:640px;background:var(--color-surface);border:1px solid var(--color-border-panel);border-radius:var(--radius-card);overflow:hidden">
      <filters-pane :open="true" pane-id="story" />
      <Teleport defer to='[data-filters-pane-body="story"]'>
        <filters-base
          :expand-filters="true"
          :in-pane="true"
          toggle-target='[data-filters-pane-head="story"]'
          :manipulation-query="undefined"
          :route="route"
          :set-advanced-filters="noop"
          :enable-save-search-filters="savedSearch"
          :entity-type="entityType"
          :should-use-state-for-route="false"
          :predefined-filters="[]"
          @filter-matcher-mapping-promise="(run) => run(entityType)"
          @advanced-filters-promise="(run) => run(entityType)"
        />
      </Teleport>
    </div>`,
});

const waitFor = async <T>(find: () => T | null | undefined) => {
  for (let i = 0; i < 40 && !find(); i++)
    await new Promise((resolve) => setTimeout(resolve, 50));
  return find();
};

export const Default: Story = {
  decorators: [withConfig(false)],
  render: renderRail(false),
};

export const Active: Story = {
  decorators: [withConfig(false)],
  render: renderRail(false),
  play: async ({ canvasElement }) => {
    const header = await waitFor(() =>
      canvasElement.querySelector<HTMLElement>('[data-cy="filters-list-item"]'),
    );
    header?.click();
    const input = await waitFor(() =>
      canvasElement.querySelector<HTMLInputElement>(
        '[data-cy="filters-list-item-panel"] [data-cy="base-input-text"]',
      ),
    );
    if (!input) return;
    input.value = "dragon";
    input.dispatchEvent(new Event("input"));
    input.blur();
  },
};

export const SavedSearchesMenu: Story = {
  name: "Saved searches menu",
  decorators: [withConfig(true)],
  render: renderRail(true),
  play: async ({ canvasElement }) => {
    const trigger = await waitFor(() =>
      canvasElement.querySelector<HTMLElement>(
        '[data-cy="overflow-menu-trigger"]',
      ),
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
    trigger?.click();
  },
};
