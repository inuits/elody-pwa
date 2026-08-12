import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ProgressBar from "./ProgressBar.vue";

const meta: Meta<typeof ProgressBar> = {
  title: "Components/ProgressBar",
  component: ProgressBar,
  tags: ["autodocs"],
  argTypes: {
    progressBarType: { control: "select", options: ["percentage", "steps"] },
  },
  // The component sizes itself to its container (progress is h-full), so
  // stories must render it inside a box with an explicit height.
  render: (args) => ({
    components: { ProgressBar },
    setup: () => ({ args }),
    template:
      '<div class="w-96 p-4"><ProgressBar class="h-3" v-bind="args" /></div>',
  }),
};
export default meta;

type Story = StoryObj<typeof ProgressBar>;

export const Percentage: Story = {
  args: {
    progress: 65,
    progressBarType: "percentage",
  },
};

export const Steps: Story = {
  args: {
    progress: 2,
    progressBarType: "steps",
    totalAmountOfSteps: 5,
  },
};
