import type { Meta, StoryObj } from "@storybook/vue3-vite";
import LinkAction from "./LinkAction.vue";
import { DamsIcons, Entitytyping } from "@/generated-types/queries";

// Context-menu item that navigates to an entity's detail page (optionally in
// a new tab). The label is a translation key that receives the translated
// entity-type name as parameter.
const meta: Meta<typeof LinkAction> = {
  title: "ContextMenuActions/LinkAction",
  component: LinkAction,
  tags: ["autodocs"],
  decorators: [
    () => ({
      template:
        '<div class="w-72 rounded-md border border-neutral-50 bg-neutral-0 py-1"><story /></div>',
    }),
  ],
};
export default meta;

type Story = StoryObj<typeof LinkAction>;

export const Default: Story = {
  args: {
    label: "contextMenu.contextMenuLinkAction.openDetail",
    icon: DamsIcons.Eye,
    entityId: "manifestation-1",
    entityType: Entitytyping.Manifestation,
  },
};

export const AsButton: Story = {
  args: {
    label: "contextMenu.contextMenuLinkAction.openDetail",
    icon: DamsIcons.Eye,
    entityId: "manifestation-1",
    entityType: Entitytyping.Manifestation,
    asButton: true,
  },
};
