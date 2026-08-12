import type { Meta, StoryObj } from "@storybook/vue3-vite";
import MenuItem from "./MenuItem.vue";
import { ignorePermissions } from "@/composables/usePermissions";
import {
  DamsIcons,
  Entitytyping,
  type MenuItem as MenuItemType,
} from "@/generated-types/queries";

// Menu entries are declared via GraphQL (GetMenu). Permission checks would
// hide every item without a backend, so the stories bypass them.
ignorePermissions.value = true;

const manifestationsItem = {
  label: "navigation.manifestations",
  entityType: Entitytyping.Manifestation,
  requiresAuth: false,
  typeLink: { route: { destination: "manifestations" } },
} as MenuItemType;

const itemWithSubMenu = {
  label: "navigation.works",
  entityType: Entitytyping.Work,
  requiresAuth: false,
  typeLink: { route: { destination: "works" } },
  subMenu: {
    workWord: {
      label: "navigation.work-word",
      entityType: Entitytyping.WorkWord,
      requiresAuth: false,
      typeLink: { route: { destination: "works-word" } },
    },
    workMusic: {
      label: "navigation.work-music",
      entityType: Entitytyping.WorkMusic,
      requiresAuth: false,
      typeLink: { route: { destination: "works-music" } },
    },
  },
} as unknown as MenuItemType;

const meta: Meta<typeof MenuItem> = {
  title: "Menu/MenuItem",
  component: MenuItem,
  tags: ["autodocs"],
  argTypes: {
    icon: { control: "select", options: Object.values(DamsIcons) },
  },
  decorators: [
    () => ({
      template:
        '<div class="w-80 bg-background-light p-4 rounded-lg"><story /></div>',
    }),
  ],
};
export default meta;

type Story = StoryObj<typeof MenuItem>;

export const Expanded: Story = {
  args: {
    menuitem: manifestationsItem,
    icon: DamsIcons.BookOpen,
    isExpanded: true,
    isBeingHovered: false,
  },
};

// Collapsed sidebar: only the icon is visible, the label moves to a tooltip.
export const Collapsed: Story = {
  args: {
    menuitem: manifestationsItem,
    icon: DamsIcons.BookOpen,
    isExpanded: false,
    isBeingHovered: false,
  },
};

export const Hovered: Story = {
  args: {
    menuitem: manifestationsItem,
    icon: DamsIcons.BookOpen,
    isExpanded: true,
    isBeingHovered: true,
  },
};

// Hovering an item with a subMenu unfolds its sub items.
export const WithSubMenu: Story = {
  args: {
    menuitem: itemWithSubMenu,
    icon: DamsIcons.ArchiveAlt,
    isExpanded: true,
    isBeingHovered: true,
  },
};
