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
  args: { from: 4, to: 14, min: 0, max: 20, unit: "" },
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

/** Typing a From value above To shows the error under the input. */
export const InputError: Story = {
  ...Default,
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>("input");
    if (!input) return;
    input.value = "18";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  },
};
