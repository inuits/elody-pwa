import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { fn } from "storybook/test";
import LibraryBar from "../LibraryBar.vue";
import PageSizeSelect from "../PageSizeSelect.vue";
import { Entitytyping } from "@/generated-types/queries";
import { registerLibraryFixtures } from "./libraryFixtures";

const meta: Meta<typeof LibraryBar> = {
  title: "Library/LibraryBar",
  component: LibraryBar,
  parameters: {
    docs: {
      description: {
        component:
          'The right-hand group of the results band: page size, "Order by" and one direction toggle. ' +
          "On a small screen (switch the viewport) it collapses into one sort button that opens a bottom sheet. " +
          "Simple search and group-by follow the route's config, which this workshop does not have.",
      },
    },
  },
  argTypes: {
    simpleSearchValue: { control: "text" },
  },
  render: (args) => ({
    components: { LibraryBar, PageSizeSelect },
    setup() {
      registerLibraryFixtures();
      const loadSortOptions = (
        promise: (entityType: Entitytyping) => Promise<void>,
      ) => promise(Entitytyping.Asset);
      const loadPageSizes = (promise: () => Promise<void>) => promise();
      const setLimit = fn();
      return { args, loadSortOptions, loadPageSizes, setLimit };
    },
    template: `
      <div style="background:var(--color-surface-panel-header);padding:var(--list-band-pad)">
        <library-bar v-bind="args" @sort-options-promise="loadSortOptions">
          <page-size-select
            class="shrink-0"
            :set-limit="setLimit"
            :selected-pagination-limit-option="20"
            :total="240"
            @pagination-limit-options-promise="loadPageSizes"
          />
        </library-bar>
      </div>`,
  }),
};

export default meta;
type Story = StoryObj<typeof LibraryBar>;

export const Default: Story = {
  args: {
    setSortKey: fn(),
    setSortOrder: fn(),
    simpleSearchValue: "",
    showGroupBy: false,
  },
};
