import type { Meta, StoryObj } from "@storybook/vue3-vite";
import SpinnerLoader from "./SpinnerLoader.vue";

const meta: Meta<typeof SpinnerLoader> = {
  title: "Components/SpinnerLoader",
  component: SpinnerLoader,
  tags: ["autodocs"],
  argTypes: {
    theme: { control: "select", options: ["default", "accent"] },
    dimensions: { control: "select", options: [5, 10, 14, 16, 20] },
  },
};
export default meta;

type Story = StoryObj<typeof SpinnerLoader>;

// The default theme uses currentColor, so it needs a colored context.
export const Default: Story = {
  args: { theme: "default", dimensions: 10 },
  render: (args) => ({
    components: { SpinnerLoader },
    setup: () => ({ args }),
    template:
      '<div class="p-8 bg-accent-normal text-neutral-white w-fit rounded"><SpinnerLoader v-bind="args" /></div>',
  }),
};

export const Accent: Story = {
  args: { theme: "accent", dimensions: 10 },
  render: (args) => ({
    components: { SpinnerLoader },
    setup: () => ({ args }),
    template: '<div class="p-8 w-fit"><SpinnerLoader v-bind="args" /></div>',
  }),
};

export const Small: Story = {
  args: { theme: "accent", dimensions: 5 },
  render: (args) => ({
    components: { SpinnerLoader },
    setup: () => ({ args }),
    template: '<div class="p-8 w-fit"><SpinnerLoader v-bind="args" /></div>',
  }),
};
