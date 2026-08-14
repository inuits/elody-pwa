import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ContextMenuActionsShell from "./ContextMenuActionsShell.vue";

const meta: Meta<typeof ContextMenuActionsShell> = {
  title: "Components/ContextMenuActionsShell",
  component: ContextMenuActionsShell,
  tags: ["autodocs"],
  render: (args) => ({
    components: { ContextMenuActionsShell },
    setup: () => ({ args }),
    template: `
      <div class="flex justify-end p-4">
        <ContextMenuActionsShell v-bind="args">
          <template #promoted>
            <button class="px-3 py-1 rounded-md bg-accent-normal text-neutral-white text-sm">
              Open detail
            </button>
          </template>
          <template #overflow>
            <p class="px-4 py-2">Export CSV</p>
            <p class="px-4 py-2">Start OCR</p>
          </template>
        </ContextMenuActionsShell>
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<typeof ContextMenuActionsShell>;

export const PromotedAndOverflow: Story = {
  args: { hasPromotedActions: true, hasOverflowActions: true },
};

export const OverflowOnly: Story = {
  args: { hasPromotedActions: false, hasOverflowActions: true },
};

export const PromotedOnly: Story = {
  args: { hasPromotedActions: true, hasOverflowActions: false },
};
