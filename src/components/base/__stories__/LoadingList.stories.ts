import type { Meta, StoryObj } from "@storybook/vue3-vite";
import LoadingList from "../LoadingList.vue";

const meta: Meta<typeof LoadingList> = {
  title: "Base/LoadingList",
  component: LoadingList,
  parameters: {
    docs: {
      description: {
        component:
          "Two pulsing placeholder rows shown while a folder-tree level loads. " +
          "It has no props.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof LoadingList>;

export const Default: Story = {
  render: () => ({
    components: { LoadingList },
    template: `<div style="max-width:360px"><loading-list /></div>`,
  }),
};
