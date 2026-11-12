import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref, watch } from "vue";
import BaseSlider from "../BaseSlider.vue";

const meta: Meta<typeof BaseSlider> = {
  title: "Base/BaseSlider",
  component: BaseSlider,
  argTypes: {
    modelValue: { control: "object" },
    min: { control: "number" },
    max: { control: "number" },
    "onUpdate:modelValue": { action: "update:modelValue" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Thin wrapper around @vueform/slider in the accent colour. Pass a " +
          "number for one handle or a [from, to] pair for a range; it is the " +
          "track inside BaseRangeSlider.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseSlider>;

export const Default: Story = {
  args: { modelValue: [20, 60], min: 0, max: 100 },
  render: (args) => ({
    components: { BaseSlider },
    setup() {
      const value = ref(args.modelValue);
      watch(
        () => args.modelValue,
        (next) => (value.value = next),
      );
      const update = (next: number | number[]) => {
        value.value = next;
        args["onUpdate:modelValue"]?.(next);
      };
      return { args, value, update };
    },
    template: `<div style="max-width:480px;padding-top:24px"><base-slider :min="args.min" :max="args.max" :model-value="value" @update:model-value="update" /></div>`,
  }),
};

export const SingleHandle: Story = {
  ...Default,
  args: { modelValue: 40, min: 0, max: 100 },
};
