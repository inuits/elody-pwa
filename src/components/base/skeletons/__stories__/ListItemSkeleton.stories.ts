import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ListItemSkeleton from "../ListItemSkeleton.vue";

const meta: Meta<typeof ListItemSkeleton> = {
  title: "Base/ListItemSkeleton",
  component: ListItemSkeleton,
  argTypes: {
    amount: { control: { type: "number", min: 1, max: 40, step: 1 } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Pulsing placeholder rows in the shape of a list item (checkbox, " +
          "thumbnail, two text lines), shown while a list's first page loads.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ListItemSkeleton>;

export const Default: Story = {
  args: { amount: 5 },
  render: (args) => ({
    components: { ListItemSkeleton },
    setup: () => ({ args }),
    template: `<div style="max-width:560px"><list-item-skeleton :key="args.amount" v-bind="args" /></div>`,
  }),
};
