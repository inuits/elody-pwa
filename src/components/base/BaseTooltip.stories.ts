import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseTooltip from "./BaseTooltip.vue";

const meta: Meta<typeof BaseTooltip> = {
  title: "Base/BaseTooltip",
  component: BaseTooltip,
  tags: ["autodocs"],
  // Slot-driven component: the activator slot receives mouse handlers via
  // `on`, the default slot is the tooltip content shown on hover.
  render: (args) => ({
    components: { BaseTooltip },
    setup: () => ({ args }),
    template: `
      <div class="p-16 w-fit">
        <BaseTooltip v-bind="args">
          <template #activator="{ on }">
            <button
              v-on="on"
              class="px-3 py-2 rounded bg-accent-normal text-white cursor-default"
            >
              Hover me
            </button>
          </template>
          <span class="text-sm text-text-placeholder">
            Dit object is gekoppeld aan 3 mediabestanden.
          </span>
        </BaseTooltip>
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<typeof BaseTooltip>;

export const Top: Story = {
  args: {
    position: "top",
    tooltipOffset: 8,
  },
};

export const Right: Story = {
  args: {
    position: "right",
    tooltipOffset: 8,
    enableAutoPlacement: false,
  },
};
