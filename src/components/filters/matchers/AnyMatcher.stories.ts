import type { Meta, StoryObj } from "@storybook/vue3-vite";
import AnyMatcher from "./AnyMatcher.vue";

// "Has any value" matcher: no user input needed — it emits the wildcard "*"
// on mount and renders a disabled input as a visual placeholder.
const meta: Meta<typeof AnyMatcher> = {
  title: "Filters/Matchers/AnyMatcher",
  component: AnyMatcher,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof AnyMatcher>;

export const Default: Story = {};
