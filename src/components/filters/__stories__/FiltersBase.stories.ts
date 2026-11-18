import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onBeforeUnmount, onMounted, provide } from "vue";
import { useSaveSearchHepler } from "@/composables/useSaveSearchHepler";
import FiltersBase from "../FiltersBase.vue";
import FiltersPane from "../FiltersPane.vue";
import { registerQueryFixture } from "@/main";
import { registerFilterFixtures } from "./filterFixtures";
import { Entitytyping } from "@/generated-types/queries";

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
    registerFilterFixtures();
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
