import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseContextMenuItem from "./BaseContextMenuItem.vue";
import { Unicons } from "@/types";

const meta: Meta<typeof BaseContextMenuItem> = {
  title: "Base/BaseContextMenuItem",
  component: BaseContextMenuItem,
  tags: ["autodocs"],
  decorators: [
    () => ({
      template:
        '<div class="w-64 p-4 border border-neutral-30 rounded"><story /></div>',
    }),
  ],
};
export default meta;

type Story = StoryObj<typeof BaseContextMenuItem>;

export const Default: Story = {
  args: {
    label: "Bewerken",
    icon: Unicons.Edit.name,
  },
};

export const Highlighted: Story = {
  args: {
    label: "Dupliceren",
    icon: (Unicons as any).Copy.name, // Copy exists at runtime but is not in the DamsIcons enum typing
    highlight: true,
  },
};

export const DisabledWithTooltip: Story = {
  args: {
    label: "Verwijderen",
    icon: Unicons.Trash.name,
    disable: true,
    tooltipLabel: "Je hebt geen rechten om dit object te verwijderen",
  },
};

export const AsButton: Story = {
  args: {
    label: "Toevoegen",
    asButton: true,
  },
};
