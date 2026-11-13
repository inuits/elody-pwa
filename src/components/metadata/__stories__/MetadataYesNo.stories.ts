import type { Meta, StoryObj } from "@storybook/vue3-vite";
import MetadataYesNo from "../MetadataYesNo.vue";

const meta: Meta<typeof MetadataYesNo> = {
  title: "Metadata/MetadataYesNo",
  component: MetadataYesNo,
  parameters: {
    docs: {
      description: {
        component:
          "How a checkbox field reads when it is not being edited: Yes with a " +
          "check or No with a cross, at the value size, never a checkbox " +
          "standing in for a value.",
      },
    },
  },
  argTypes: { value: { control: "boolean" } },
};

export default meta;
type Story = StoryObj<typeof MetadataYesNo>;

export const Default: Story = { args: { value: true } };

export const No: Story = { args: { value: false } };
