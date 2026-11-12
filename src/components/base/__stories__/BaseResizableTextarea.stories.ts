import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref, watch } from "vue";
import BaseResizableTextarea from "../BaseResizableTextarea.vue";

const meta: Meta<typeof BaseResizableTextarea> = {
  title: "Base/BaseResizableTextarea",
  component: BaseResizableTextarea,
  argTypes: {
    modelValue: { control: "text" },
    "onUpdate:modelValue": { action: "update:modelValue" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Textarea that grows with its content instead of scrolling. It is " +
          "the multi-line mode of BaseInputTextNumberDatetime.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseResizableTextarea>;

export const Default: Story = {
  args: {
    modelValue:
      "Self-portrait with a fur cap.\nType more lines to see the field grow.",
  },
  render: (args) => ({
    components: { BaseResizableTextarea },
    setup() {
      const value = ref(args.modelValue);
      watch(
        () => args.modelValue,
        (next) => (value.value = next),
      );
      const update = (next: string) => {
        value.value = next;
        args["onUpdate:modelValue"]?.(next);
      };
      return { value, update };
    },
    template: `<div style="max-width:420px"><base-resizable-textarea aria-label="Description" :model-value="value" @update:model-value="update" /></div>`,
  }),
};
