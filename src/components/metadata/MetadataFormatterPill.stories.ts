import type { Meta, StoryObj } from "@storybook/vue3-vite";
import MetadataFormatterPill from "./MetadataFormatterPill.vue";

// Note: only the "pill|auto" formatter is exercised here. Named pill types
// (e.g. "pill|status") look up their colors in the formattersSettings loaded
// from the backend config, which is empty in Storybook.
const meta: Meta<typeof MetadataFormatterPill> = {
  title: "Metadata/MetadataFormatterPill",
  component: MetadataFormatterPill,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "lg"] },
  },
  decorators: [
    () => ({ template: '<div class="w-96 p-4 flex"><story /></div>' }),
  ],
};
export default meta;

type Story = StoryObj<typeof MetadataFormatterPill>;

export const Default: Story = {
  args: {
    formatter: "pill|auto",
    label: "published",
  },
};

export const Large: Story = {
  args: {
    formatter: "pill|auto",
    label: "in restoration",
    size: "lg",
  },
};
