import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BulkOperationsDeleteRelations from "./BulkOperationsDeleteRelations.vue";

// Confirmation panel shown (inside BulkOperationsModal) before removing the
// relations between a parent entity and the selected related entities. No
// props: parent id, relation type and selection come from modal state.
const meta: Meta<typeof BulkOperationsDeleteRelations> = {
  title: "BulkOperations/BulkOperationsDeleteRelations",
  component: BulkOperationsDeleteRelations,
  tags: ["autodocs"],
  decorators: [
    () => ({
      template:
        '<div class="max-w-2xl bg-background-light rounded-lg"><story /></div>',
    }),
  ],
};
export default meta;

type Story = StoryObj<typeof BulkOperationsDeleteRelations>;

export const Default: Story = {};
