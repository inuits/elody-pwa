import type { Meta, StoryObj } from "@storybook/vue3-vite";
import NavSubItem from "../NavSubItem.vue";
import type { MenuItem } from "@/generated-types/queries";

const link = (label: string, destination: string) => ({
  label,
  typeLink: { route: { destination } },
});

const meta: Meta<typeof NavSubItem> = {
  title: "Navigation/NavSubItem",
  component: NavSubItem,
  parameters: {
    docs: {
      description: {
        component:
          "An entry inside a navigation group. A route is a link, an entry " +
          "that opens a modal (such as a create form) is a button with a " +
          "plus, and an entry with neither is plain text.",
      },
    },
  },
  argTypes: { item: { control: "object" } },
};

export default meta;
type Story = StoryObj<typeof NavSubItem>;

export const Default: Story = {
  args: { item: link("Companies", "companies") as unknown as MenuItem },
  render: (args) => ({
    components: { NavSubItem },
    setup: () => ({ args }),
    template: `
      <ul style="width:220px;list-style:none;padding:0">
        <nav-sub-item v-bind="args" />
      </ul>`,
  }),
};

export const States: Story = {
  render: () => ({
    components: { NavSubItem },
    setup() {
      const path = window.location.pathname;
      const here = path.substring(path.lastIndexOf("/") + 1);
      return {
        items: [
          link("Companies", "companies"),
          link("Venues", here),
          {
            label: "New venue",
            typeLink: { modal: { typeModal: "DynamicForm" } },
          },
          { label: "Archive" },
        ] as unknown as MenuItem[],
      };
    },
    template: `
      <ul style="width:220px;list-style:none;padding:0;display:flex;flex-direction:column;gap:4px">
        <nav-sub-item v-for="item in items" :key="item.label" :item="item" />
      </ul>`,
  }),
};
