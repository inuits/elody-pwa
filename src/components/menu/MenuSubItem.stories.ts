import type { Meta, StoryObj } from "@storybook/vue3-vite";
import MenuSubItem from "./MenuSubItem.vue";
import { ignorePermissions } from "@/composables/usePermissions";
import {
  Entitytyping,
  type MenuItem as MenuItemType,
} from "@/generated-types/queries";

// Sub entry of an expanded menu item. Permission checks would hide it
// without a backend, so the stories bypass them.
ignorePermissions.value = true;

const meta: Meta<typeof MenuSubItem> = {
  title: "Menu/MenuSubItem",
  component: MenuSubItem,
  tags: ["autodocs"],
  decorators: [
    () => ({
      template:
        '<div class="w-80 bg-background-light p-4 rounded-lg"><story /></div>',
    }),
  ],
};
export default meta;

type Story = StoryObj<typeof MenuSubItem>;

export const RouteLink: Story = {
  args: {
    show: true,
    subMenuItem: {
      label: "navigation.work-word",
      entityType: Entitytyping.WorkWord,
      requiresAuth: false,
      typeLink: { route: { destination: "works-word" } },
    } as MenuItemType,
  },
};

// A sub item whose typeLink opens a modal (e.g. an upload/create form)
// instead of navigating; it gets a plus icon.
export const ModalAction: Story = {
  args: {
    show: true,
    subMenuItem: {
      label: "navigation.create-manifestation",
      entityType: Entitytyping.Manifestation,
      requiresAuth: false,
      typeLink: {
        modal: { typeModal: "DynamicForm", formQuery: "GetCreateForm" },
      },
    } as unknown as MenuItemType,
  },
};
