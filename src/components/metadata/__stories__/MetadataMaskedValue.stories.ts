import type { Meta, StoryObj } from "@storybook/vue3-vite";
import MetadataMaskedValue from "../MetadataMaskedValue.vue";

const meta: Meta<typeof MetadataMaskedValue> = {
  title: "Metadata/MetadataMaskedValue",
  component: MetadataMaskedValue,
  parameters: {
    docs: {
      description: {
        component:
          "A sensitive value shown as dots until the eye button reveals it. " +
          "With a reveal query the value is fetched only on reveal; " +
          "otherwise it is already on the page. Revealed values can be copied.",
      },
    },
  },
  argTypes: {
    value: { control: "text", type: { name: "string", required: false } },
    maskLength: { control: { type: "number", min: 4, max: 32 } },
  },
};

export default meta;
type Story = StoryObj<typeof MetadataMaskedValue>;

export const Default: Story = {
  args: {
    metadataKey: "national_number",
    value: "85.07.30-033.61",
    copyToClipboard: true,
    maskLength: 12,
  },
};
