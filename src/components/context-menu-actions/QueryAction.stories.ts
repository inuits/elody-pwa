import type { Meta, StoryObj } from "@storybook/vue3-vite";
import QueryAction from "./QueryAction.vue";
import { DamsIcons } from "@/generated-types/queries";

// Context-menu item that runs a named GraphQL query/mutation (loaded by name
// from the generated documents) against the entity, optionally refetching
// the parent or navigating to a created entity afterwards.
const meta: Meta<typeof QueryAction> = {
  title: "ContextMenuActions/QueryAction",
  component: QueryAction,
  tags: ["autodocs"],
  decorators: [
    () => ({
      template:
        '<div class="w-72 rounded-md border border-neutral-50 bg-neutral-0 py-1"><story /></div>',
    }),
  ],
};
export default meta;

type Story = StoryObj<typeof QueryAction>;

export const Default: Story = {
  args: {
    label: "contextMenu.contextMenuQueryAction.regenerateLabel",
    icon: DamsIcons.Update,
    query: "GetEntityById",
    entityId: "manifestation-1",
  },
};

export const WithRefresh: Story = {
  args: {
    label: "contextMenu.contextMenuQueryAction.regenerateLabel",
    icon: DamsIcons.Update,
    query: "GetEntityById",
    refreshAfterAction: true,
    entityId: "manifestation-1",
  },
};
