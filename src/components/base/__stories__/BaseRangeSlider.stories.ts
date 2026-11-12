import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseRangeSlider from "../BaseRangeSlider.vue";

const meta: Meta<typeof BaseRangeSlider> = {
  title: "Base/BaseRangeSlider",
  component: BaseRangeSlider,
  argTypes: {
    from: { control: "number" },
    to: { control: "number" },
    min: { control: "number" },
    max: { control: "number" },
    unit: { control: "text" },
    onUpdateRange: { action: "updateRange" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Range filter: a two-handle slider with a tick scale and From/To " +
          "number inputs that stay in sync with the handles. Used by the " +
          "range matcher in the filters panel.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseRangeSlider>;

export const Default: Story = {
  args: { from: 1900, to: 1950, min: 1800, max: 2000, unit: "" },
  render: (args) => ({
    components: { BaseRangeSlider },
    setup: () => ({ args }),
    template: `<div style="max-width:480px"><base-range-slider v-bind="args" :key="args.min + '-' + args.max" /></div>`,
  }),
};

export const WithUnit: Story = {
  ...Default,
  args: { from: 20, to: 80, min: 0, max: 100, unit: "cm" },
};
