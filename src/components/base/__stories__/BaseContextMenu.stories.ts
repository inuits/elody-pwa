import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseContextMenu from "../BaseContextMenu.vue";
import BaseContextMenuItem from "../BaseContextMenuItem.vue";
import { Unicons } from "@/types";

const meta: Meta<typeof BaseContextMenu> = {
  title: "Base/BaseContextMenu",
  component: BaseContextMenu,
  parameters: {
    docs: {
      description: {
        component:
          "The menu surface behind every Actions trigger and split button. " +
          "Hover an item for the wash, use the arrow keys for the focus ring; " +
          "a disabled item stays focusable and gives its reason in a tooltip.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseContextMenu>;

export const States: Story = {
  render: () => ({
    components: { BaseContextMenu, BaseContextMenuItem },
    setup: () => ({
      Unicons,
      contextMenu: { isVisible: true, position: { x: 40, y: 40 } },
    }),
    template: `
      <div style="height:260px">
        <base-context-menu :context-menu="contextMenu">
          <base-context-menu-item :icon="Unicons.Edit.name" label="Edit metadata" />
          <base-context-menu-item :icon="Unicons.Download.name" label="Download original" highlight />
          <base-context-menu-item :icon="Unicons.Link.name" label="Share link" disable
                                  tooltip-label="You need edit rights to share" />
          <base-context-menu-item :icon="Unicons.Trash.name" label="Delete" />
        </base-context-menu>
      </div>`,
  }),
};
