import type { Meta, StoryObj } from "@storybook/vue3-vite";
import MetadataTruncatedText from "../MetadataTruncatedText.vue";

const meta: Meta<typeof MetadataTruncatedText> = {
  title: "Metadata/MetadataTruncatedText",
  component: MetadataTruncatedText,
  parameters: {
    docs: {
      description: {
        component:
          "Clamps a value to a number of lines and reports whether it " +
          "overflows, so the field row can offer to show the rest. Wrapped " +
          "chips are hugged to their widest line.",
      },
    },
  },
  argTypes: {
    lineClamp: { control: { type: "number", min: 1, max: 10 } },
    "onOverflow-status": { action: "overflow-status" },
  },
};

export default meta;
type Story = StoryObj<typeof MetadataTruncatedText>;

export const Default: Story = {
  args: { lineClamp: 2, disabled: false },
  render: (args) => ({
    components: { MetadataTruncatedText },
    setup: () => ({ args }),
    template: `
      <div style="max-width:320px;font-size:var(--text-value)">
        <metadata-truncated-text v-bind="args">
          A collection of tales gathered along the North Sea coast in the late
          nineteenth century, retold for children and illustrated with woodcuts
          by local artists. The edition includes a glossary of dialect words and
          an afterword on the collectors.
        </metadata-truncated-text>
      </div>`,
  }),
};
