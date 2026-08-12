import type { Meta, StoryObj } from "@storybook/vue3-vite";
import MetadataTruncatedText from "./MetadataTruncatedText.vue";

const longText =
  "This seventeenth-century portrait shows an unknown lady holding an ostrich " +
  "feather fan. The sitter wears a black satin gown with a broad lace collar, " +
  "and the dark background places all emphasis on her face and hands, a " +
  "compositional device typical of the period.";

const meta: Meta<typeof MetadataTruncatedText> = {
  title: "Metadata/MetadataTruncatedText",
  component: MetadataTruncatedText,
  tags: ["autodocs"],
  // The component clamps whatever its slot renders, so stories wrap it in a
  // fixed-width container and pass the text through the default slot.
  render: (args) => ({
    components: { MetadataTruncatedText },
    setup: () => ({ args, longText }),
    template: `
      <div class="w-72 p-4 text-sm">
        <MetadataTruncatedText v-bind="args">{{ longText }}</MetadataTruncatedText>
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<typeof MetadataTruncatedText>;

export const SingleLine: Story = {
  args: {
    lineClamp: 1,
  },
};

export const ThreeLines: Story = {
  args: {
    lineClamp: 3,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
