import type { Meta, StoryObj } from "@storybook/vue3-vite";
import NavItem from "../NavItem.vue";
import type { MenuItem } from "@/generated-types/queries";

const link = (label: string, icon: string, destination: string) => ({
  label,
  icon,
  typeLink: { route: { destination } },
});

const group = (destination = "organisations") => ({
  ...link("Organisations", "Apps", destination),
  subMenu: {
    name: "sub-menu-organisations",
    companies: link("Companies", "Apps", "companies"),
    venues: link("Venues", "Apps", "venues"),
  },
});

const currentSegment = () =>
  window.location.pathname.substring(
    window.location.pathname.lastIndexOf("/") + 1,
  );

const meta: Meta<typeof NavItem> = {
  title: "Navigation/NavItem",
  component: NavItem,
  parameters: {
    docs: {
      description: {
        component:
          "One entry of the main navigation. On the closed rail it is an " +
          "icon with its label as a tooltip; on the open menu the label " +
          "shows. A group opens a flyout next to the closed rail, or its " +
          "sub-items inline in the open menu. The current page gets the " +
          "accent wash and aria-current.",
      },
    },
  },
  argTypes: {
    item: { control: "object" },
    expanded: { control: "boolean" },
    open: { control: "boolean" },
    onToggle: { action: "toggle" },
    onClose: { action: "close" },
  },
};

export default meta;
type Story = StoryObj<typeof NavItem>;

export const Default: Story = {
  args: {
    item: group() as unknown as MenuItem,
    expanded: true,
    open: true,
  },
  render: (args) => ({
    components: { NavItem },
    setup: () => ({ args }),
    template: `
      <ul style="width:240px;list-style:none;padding:0">
        <nav-item v-bind="args" />
      </ul>`,
  }),
};

export const States: Story = {
  render: () => ({
    components: { NavItem },
    setup() {
      const here = currentSegment();
      return {
        library: link("Library", "BookOpen", "library") as unknown as MenuItem,
        current: link("Media", "Image", here) as unknown as MenuItem,
        group: group() as unknown as MenuItem,
      };
    },
    template: `
      <div style="display:flex;gap:48px;align-items:flex-start">
        <div>
          <p style="font-size:var(--text-label);color:var(--color-text-secondary)">Closed rail</p>
          <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:4px">
            <nav-item :item="library" :expanded="false" :open="false" />
            <nav-item :item="current" :expanded="false" :open="false" />
            <nav-item :item="group" :expanded="false" :open="false" />
          </ul>
        </div>
        <div style="width:240px">
          <p style="font-size:var(--text-label);color:var(--color-text-secondary)">Open menu: resting, current page, open group</p>
          <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:4px">
            <nav-item :item="library" :expanded="true" :open="false" />
            <nav-item :item="current" :expanded="true" :open="false" />
            <nav-item :item="group" :expanded="true" :open="true" />
          </ul>
        </div>
      </div>`,
  }),
};

export const Flyout: Story = {
  render: () => ({
    components: { NavItem },
    setup: () => ({ group: group() as unknown as MenuItem }),
    template: `
      <ul style="list-style:none;padding:0;width:52px;height:240px">
        <nav-item :item="group" :expanded="false" :open="true" />
      </ul>`,
  }),
};
