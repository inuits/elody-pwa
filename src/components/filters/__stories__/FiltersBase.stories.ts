import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { provide } from "vue";
import FiltersBase from "../FiltersBase.vue";
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
          label: "Titel",
        }),
        genre: advancedFilter({
          type: "selection",
          key: ["genre"],
          label: "Genre",
          selectionOption: "checkboxlist",
          options: [
            { __typename: "DropdownOption", icon: null, label: "avontuur", value: "avontuur" },
            { __typename: "DropdownOption", icon: null, label: "fantasy", value: "fantasy" },
            { __typename: "DropdownOption", icon: null, label: "sprookje", value: "sprookje" },
          ],
        }),
        publication_year: advancedFilter({
          type: "date",
          key: ["publication_year"],
          label: "Jaar van uitgave",
        }),
      },
    },
  });
};

const routeFixture = {
  name: "Home",
  path: "/",
  fullPath: "/",
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
          "the header, matcher chrome per type, per-section Wis filter and " +
          "the shared Zoek commit. Definitions come from the entity type's " +
          "filter query; here they resolve from story fixtures.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FiltersBase>;

export const Default: Story = {
  render: () => ({
    components: { FiltersBase },
    setup() {
      registerFixtures();
      provide("config", {
        features: { savedSearch: { enabled: false } },
      });
      return {
        route: routeFixture,
        entityType: Entitytyping.BaseEntity,
        noop: () => undefined,
      };
    },
    template: `
      <div style="max-width:340px">
        <filters-base
          :expand-filters="true"
          :manipulation-query="undefined"
          :route="route"
          :set-advanced-filters="noop"
          :enable-save-search-filters="false"
          :entity-type="entityType"
          :should-use-state-for-route="false"
          :predefined-filters="[]"
          @filter-matcher-mapping-promise="(run) => run(entityType)"
          @advanced-filters-promise="(run) => run(entityType)"
        />
      </div>`,
  }),
};
