import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BulkOperationsDeleteEntities from "./BulkOperationsDeleteEntities.vue";

// Confirmation panel shown (inside BulkOperationsModal) before bulk-deleting
// the selected entities. It has no props: the entity-type label and optional
// linked-entities checkboxes come from modal state and a deletion-form query,
// so standalone it renders the plain confirm/cancel step.
const meta: Meta<typeof BulkOperationsDeleteEntities> = {
  title: "BulkOperations/BulkOperationsDeleteEntities",
  component: BulkOperationsDeleteEntities,
  tags: ["autodocs"],
  decorators: [
    () => ({
      template:
        '<div class="max-w-2xl bg-background-light rounded-lg"><story /></div>',
    }),
  ],
};
export default meta;

type Story = StoryObj<typeof BulkOperationsDeleteEntities>;

export const Default: Story = {};
