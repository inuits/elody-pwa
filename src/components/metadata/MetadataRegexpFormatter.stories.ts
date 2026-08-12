import type { Meta, StoryObj } from "@storybook/vue3-vite";
import MetadataRegexpFormatter from "./MetadataRegexpFormatter.vue";

const meta: Meta<typeof MetadataRegexpFormatter> = {
  title: "Metadata/MetadataRegexpFormatter",
  component: MetadataRegexpFormatter,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof MetadataRegexpFormatter>;

export const Default: Story = {
  args: {
    label: "SK-A-1234",
  },
};

export const LongValue: Story = {
  args: {
    label:
      "BE/942855/1234/567 — archief van het Museum voor Schone Kunsten, aanwinstenregister 1902-1914",
  },
};
