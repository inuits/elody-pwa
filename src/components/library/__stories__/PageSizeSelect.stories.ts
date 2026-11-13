import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { fn } from "storybook/test";
import PageSizeSelect from "../PageSizeSelect.vue";
import { registerLibraryFixtures } from "./libraryFixtures";

const meta: Meta<typeof PageSizeSelect> = {
  title: "Library/PageSizeSelect",
  component: PageSizeSelect,
  parameters: {
    docs: {
      description: {
        component:
          '"Items: 20" beside the sort controls. The options come from the client config; the select hides ' +
          "itself when the whole list fits on the smallest page, and on a small screen it becomes chips in the sort sheet.",
      },
    },
  },
  argTypes: {
    total: { control: "number" },
    selectedPaginationLimitOption: {
      control: "select",
      options: [20, 50, 100],
    },
  },
  render: (args) => ({
    components: { PageSizeSelect },
    setup() {
      registerLibraryFixtures();
      const load = (promise: () => Promise<void>) => promise();
      return { args, load };
    },
    template: `<page-size-select v-bind="args" @pagination-limit-options-promise="load" />`,
  }),
};

export default meta;
type Story = StoryObj<typeof PageSizeSelect>;

export const Default: Story = {
  args: { setLimit: fn(), selectedPaginationLimitOption: 20, total: 240 },
};

export const FitsOnePage: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "A total of 12 fits the smallest page size, so the select stays hidden.",
      },
    },
  },
  args: { ...Default.args, total: 12 },
};
