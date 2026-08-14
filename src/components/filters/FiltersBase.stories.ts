import type { Meta, StoryObj } from "@storybook/vue3-vite";
import type { RouteLocationNormalizedLoaded } from "vue-router";
import FiltersBase from "./FiltersBase.vue";
import { Entitytyping } from "@/generated-types/queries";

// FiltersBase normally receives the current route from BaseLibrary; a minimal
// stub is enough since state persistence is disabled in these stories.
const storyRoute = {
  name: "storybook",
  path: "/",
  fullPath: "/",
  params: {},
  query: {},
  hash: "",
  matched: [],
  meta: {},
  redirectedFrom: undefined,
} as unknown as RouteLocationNormalizedLoaded;

const meta: Meta<typeof FiltersBase> = {
  title: "Filters/FiltersBase",
  component: FiltersBase,
  tags: ["autodocs"],
  decorators: [
    // The component reads `config.features.savedSearch`; the global preview
    // config stub has no `features`, so provide a fuller one here.
    () => ({
      template: '<div class="w-[40rem] p-4"><story /></div>',
      provide: {
        config: {
          customization: {},
          features: { savedSearch: { enabled: false } },
        },
      },
    }),
  ],
};
export default meta;

type Story = StoryObj<typeof FiltersBase>;

const commonArgs = {
  manipulationQuery: undefined,
  route: storyRoute,
  setAdvancedFilters: () => {},
  enableSaveSearchFilters: false,
  entityType: Entitytyping.BaseEntity,
  shouldUseStateForRoute: false,
  predefinedFilters: [],
};

// The filter definitions themselves are GraphQL-driven (fetched via the
// promises this component emits on mount), so isolated stories show the
// chrome with an empty filter list.
export const Collapsed: Story = {
  args: {
    ...commonArgs,
    expandFilters: false,
  },
};

export const Expanded: Story = {
  args: {
    ...commonArgs,
    expandFilters: true,
  },
};

// When the simple search bar is active, advanced filters are disabled and the
// header shows a hint instead of the active-filter count.
export const DisabledBySimpleSearch: Story = {
  args: {
    ...commonArgs,
    expandFilters: false,
    simpleSearchActive: true,
  },
};
