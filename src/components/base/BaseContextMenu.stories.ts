import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseContextMenu from "./BaseContextMenu.vue";
import BaseContextMenuItem from "./BaseContextMenuItem.vue";
import { ContextMenuDirection } from "@/generated-types/queries";

const meta: Meta<typeof BaseContextMenu> = {
  title: "Base/BaseContextMenu",
  component: BaseContextMenu,
  tags: ["autodocs"],
  argTypes: {
    direction: {
      control: "select",
      options: Object.values(ContextMenuDirection),
    },
  },
  // The menu teleports to body and positions itself at contextMenu.position.
  render: (args) => ({
    components: { BaseContextMenu, BaseContextMenuItem },
    setup: () => ({ args }),
    template: `
      <div class="h-64 p-4 text-sm text-text-light">
        Right-click menu rendered at position ({{ args.contextMenu.position.x }}, {{ args.contextMenu.position.y }})
        <BaseContextMenu v-bind="args">
          <BaseContextMenuItem label="Bewerken" />
          <BaseContextMenuItem label="Dupliceren" />
          <BaseContextMenuItem label="Verwijderen" />
        </BaseContextMenu>
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<typeof BaseContextMenu>;

export const Open: Story = {
  args: {
    contextMenu: {
      isVisible: true,
      position: { x: 120, y: 120 },
    } as any,
  },
};

export const Closed: Story = {
  args: {
    contextMenu: {
      isVisible: false,
      position: { x: 120, y: 120 },
    } as any,
  },
};
