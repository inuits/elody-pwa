import type { Meta, StoryObj } from "@storybook/vue3-vite";
import LanguageSelect from "./LanguageSelect.vue";

// The available languages come from the i18n instance; the Storybook mock
// i18n only registers "en", so the dropdown offers a single locale.
const meta: Meta<typeof LanguageSelect> = {
  title: "Components/LanguageSelect",
  component: LanguageSelect,
  tags: ["autodocs"],
  decorators: [
    () => ({ template: '<div class="w-96 h-48 p-4"><story /></div>' }),
  ],
};
export default meta;

type Story = StoryObj<typeof LanguageSelect>;

export const Default: Story = {};
