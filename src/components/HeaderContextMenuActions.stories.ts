import type { Meta, StoryObj } from "@storybook/vue3-vite";
import HeaderContextMenuActions from "./HeaderContextMenuActions.vue";
import { Entitytyping } from "@/generated-types/queries";
import type { ContextMenuActionRouteConfig } from "@/types/contextMenuRouteConfig";

// Route-config-driven header actions. An action with showAsButton renders
// as a promoted button next to the header; the rest live behind the
// ellipsis overflow menu.
const actions = [
  {
    type: "link",
    label: "Open in viewer",
    icon: "Eye",
    showAsButton: true,
  },
  {
    type: "link",
    label: "Open publieke pagina",
    icon: "Link",
    openInNewTab: true,
  },
] as unknown as ContextMenuActionRouteConfig[];

const meta: Meta<typeof HeaderContextMenuActions> = {
  title: "Components/HeaderContextMenuActions",
  component: HeaderContextMenuActions,
  tags: ["autodocs"],
  decorators: [
    () => ({ template: '<div class="flex justify-end p-4"><story /></div>' }),
  ],
};
export default meta;

type Story = StoryObj<typeof HeaderContextMenuActions>;

export const PromotedAndOverflow: Story = {
  args: {
    actions,
    entityId: "asset-1902-c-14",
    entityType: Entitytyping.Work,
  },
};

export const OverflowOnly: Story = {
  args: {
    actions: actions.filter(
      (action) => !("showAsButton" in action && (action as any).showAsButton),
    ),
    entityId: "asset-1902-c-14",
    entityType: Entitytyping.Work,
  },
};
