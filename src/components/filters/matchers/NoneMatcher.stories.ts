import type { Meta, StoryObj } from "@storybook/vue3-vite";
import NoneMatcher from "./NoneMatcher.vue";

// "Has no value" matcher: no user input needed — it emits the wildcard "*"
// on mount (negated server-side) and renders a disabled placeholder input.
const meta: Meta<typeof NoneMatcher> = {
  title: "Filters/Matchers/NoneMatcher",
  component: NoneMatcher,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="w-96 p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof NoneMatcher>;

export const Default: Story = {};
