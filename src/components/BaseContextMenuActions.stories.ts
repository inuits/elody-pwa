import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseContextMenuActions from "./BaseContextMenuActions.vue";
import {
  Entitytyping,
  type ContextMenuActions,
} from "@/generated-types/queries";

// Context-menu actions as baseGraphql declares them per entity type. An
// action with showAsButton renders as a promoted button; the others sit
// behind the ellipsis overflow menu (opened on click).
const contextMenuActions = {
  __typename: "ContextMenuActions",
  doLinkAction: {
    __typename: "ContextMenuLinkAction",
    label: "Open detail page",
    icon: "Eye",
    showAsButton: true,
  },
  doGeneralAction: {
    __typename: "ContextMenuGeneralAction",
    label: "Regenerate derivatives",
    icon: "Process",
    action: "startOcr",
  },
} as unknown as ContextMenuActions;

const meta: Meta<typeof BaseContextMenuActions> = {
  title: "Components/BaseContextMenuActions",
  component: BaseContextMenuActions,
  tags: ["autodocs"],
  decorators: [
    () => ({ template: '<div class="flex justify-end p-4"><story /></div>' }),
  ],
};
export default meta;

type Story = StoryObj<typeof BaseContextMenuActions>;

export const PromotedAndOverflow: Story = {
  args: {
    contextMenuActions,
    entityId: "asset-1902-c-14",
    entityType: Entitytyping.Work,
    bulkOperationsContext: undefined,
  },
};

export const OverflowOnly: Story = {
  args: {
    contextMenuActions: {
      __typename: "ContextMenuActions",
      doLinkAction: {
        __typename: "ContextMenuLinkAction",
        label: "Open detail page",
        icon: "Eye",
      },
    } as unknown as ContextMenuActions,
    entityId: "asset-1902-c-14",
    entityType: Entitytyping.Work,
    bulkOperationsContext: undefined,
  },
};
