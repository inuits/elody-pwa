import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseIcon from "../BaseIcon.vue";
import { Unicon } from "vue-unicons";
import { Unicons } from "@/types";

const iconNames = Object.values(Unicons).map((icon) => icon.name);

const meta: Meta<typeof BaseIcon> = {
  title: "Base/BaseIcon",
  component: BaseIcon,
  argTypes: {
    name: { control: "select", options: iconNames },
    iconStyle: { control: false },
    viewBox: { control: "text" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Renders a registered unicon as a plain inline SVG path, for places " +
          "that need the bare glyph, such as context-menu items.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseIcon>;

export const Default: Story = {
  args: { name: Unicons.SearchGlass.name, iconStyle: "line", viewBox: "0 0 24 24" },
  render: (args) => ({
    components: { BaseIcon },
    setup: () => ({ args }),
    template: `<div style="width:24px;height:24px"><base-icon v-bind="args" :key="args.name + args.iconStyle" /></div>`,
  }),
};

const registeredIcons = Object.values(Unicons)
  .map((icon) => icon.name)
  .filter(
    (name, index, names) =>
      name &&
      names.indexOf(name) === index &&
      Unicon.lib.some((i: { name: string; style: string }) => i.name === name && i.style === "line"),
  )
  .sort();

/** Every icon registered in the interface, by its Unicons name. */
export const AllIcons: Story = {
  name: "All icons",
  render: () => ({
    components: { BaseIcon },
    setup: () => ({ registeredIcons }),
    template: `
      <ul style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:6px;list-style:none;padding:0;margin:0">
        <li v-for="name in registeredIcons" :key="name"
            style="display:flex;align-items:center;gap:8px;padding:6px;border:1px solid var(--color-border-faint);border-radius:var(--radius-input);background:var(--color-surface)">
          <span style="width:20px;height:20px;flex:0 0 20px;fill:var(--color-text-body)"><base-icon :name="name" aria-hidden="true" /></span>
          <code style="font-size:var(--text-hint);overflow-wrap:anywhere">{{ name }}</code>
        </li>
      </ul>`,
  }),
};
