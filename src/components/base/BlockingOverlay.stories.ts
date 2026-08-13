import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BlockingOverlay from "./BlockingOverlay.vue";

const meta: Meta<typeof BlockingOverlay> = {
  title: "Base/BlockingOverlay",
  component: BlockingOverlay,
  tags: ["autodocs"],
  // The overlay positions itself absolute/fixed over its nearest relative
  // ancestor, so the story wraps it in a sized relative container.
  render: (args) => ({
    components: { BlockingOverlay },
    setup: () => ({ args }),
    template: `
      <div class="relative h-64 w-96 border border-neutral-30 rounded p-4">
        <p class="text-sm text-text-body">
          Content dat geblokkeerd wordt tijdens het opslaan…
        </p>
        <BlockingOverlay v-bind="args" />
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<typeof BlockingOverlay>;

export const Blocking: Story = {
  args: {
    isBlocking: true,
  },
};

export const Idle: Story = {
  args: {
    isBlocking: false,
  },
};
