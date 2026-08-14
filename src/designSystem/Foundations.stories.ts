import type { Meta, StoryObj } from "@storybook/vue3-vite";
import Foundations from "./Foundations.vue";

const meta: Meta<typeof Foundations> = {
  title: "Design system/Foundations",
  component: Foundations,
  tags: ["autodocs"],
  parameters: {
    a11y: { test: "error" },
  },
};
export default meta;

type Story = StoryObj<typeof Foundations>;

/** Swatches, type scale, radii, elevation and motion, resolved live from the
 *  CSS variables — use the Tenant toolbar to verify every client scope. */
export const Default: Story = {};
