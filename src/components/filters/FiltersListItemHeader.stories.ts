import type { Meta, StoryObj } from "@storybook/vue3-vite";
import FiltersListItemHeader from "./FiltersListItemHeader.vue";
import { Unicons } from "@/types";

const meta: Meta<typeof FiltersListItemHeader> = {
  title: "Filters/FiltersListItemHeader",
  component: FiltersListItemHeader,
  tags: ["autodocs"],
  decorators: [
    () => ({
      template: '<div class="w-96 bg-background-light"><story /></div>',
    }),
  ],
};
export default meta;

type Story = StoryObj<typeof FiltersListItemHeader>;

export const Collapsed: Story = {
  args: {
    isActive: false,
    label: "Title",
    icon: Unicons.Plus.name,
  },
};

export const ActiveFilter: Story = {
  args: {
    isActive: true,
    label: "Creation date",
    icon: Unicons.Minus.name,
  },
};

export const WithTooltip: Story = {
  args: {
    isActive: false,
    label: "Asset type",
    icon: Unicons.Plus.name,
    tooltip: true,
    tooltipText: "Filter on the type of the asset (image, video, audio…)",
  },
};
