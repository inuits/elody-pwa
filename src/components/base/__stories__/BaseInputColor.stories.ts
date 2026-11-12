import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref, watch } from "vue";
import BaseInputColor from "../BaseInputColor.vue";

const meta: Meta<typeof BaseInputColor> = {
  title: "Base/BaseInputColor",
  component: BaseInputColor,
  argTypes: {
    modelValue: { control: "color" },
    disabled: { control: "boolean" },
    "onUpdate:modelValue": { action: "update:modelValue" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Colour metadata field: a native colour swatch next to a text " +
          "input holding the hex value, kept in sync both ways.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseInputColor>;

export const Default: Story = {
  args: { modelValue: "#0057B1", disabled: false },
  render: (args) => ({
    components: { BaseInputColor },
    setup() {
      const value = ref(args.modelValue);
      watch(
        () => args.modelValue,
        (next) => (value.value = next),
      );
      const update = (next: string | undefined) => {
        value.value = next;
        args["onUpdate:modelValue"]?.(next);
      };
      return { args, value, update };
    },
    template: `<div style="max-width:320px"><base-input-color :disabled="args.disabled" :model-value="value" @update:model-value="update" /></div>`,
  }),
};

export const Disabled: Story = {
  ...Default,
  args: { modelValue: "#0057B1", disabled: true },
};
