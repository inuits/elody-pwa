import type { Meta, StoryObj } from "@storybook/vue3-vite";
import LogInLogout from "./LogInLogout.vue";

// The Storybook auth mock is authenticated as user "storybook", so the
// component renders the profile + log-out state.
const meta: Meta<typeof LogInLogout> = {
  title: "Components/LogInLogout",
  component: LogInLogout,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-64 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof LogInLogout>;

export const Expanded: Story = {
  args: { isExpanded: true },
};

export const Collapsed: Story = {
  args: { isExpanded: false },
};
