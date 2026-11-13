import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ListColumnHeader from "../ListColumnHeader.vue";

const meta: Meta<typeof ListColumnHeader> = {
  title: "Library/ViewModes/ListColumnHeader",
  component: ListColumnHeader,
  parameters: {
    docs: {
      description: {
        component:
          'The sticky column-header row of a list whose rows share the same fields: the "Select page" checkbox, ' +
          'the field labels placed over the first row\'s measured cells, and "Actions" on the right.',
      },
    },
  },
  argTypes: {
    labels: { control: "object" },
    cellStyles: { control: "object" },
    checkboxStyle: { control: "object" },
    onTogglePageSelection: { action: "togglePageSelection" },
  },
  render: (args) => ({
    components: { ListColumnHeader },
    setup: () => ({ args }),
    template: `<div style="max-width:720px"><list-column-header v-bind="args" /></div>`,
  }),
};

export default meta;
type Story = StoryObj<typeof ListColumnHeader>;

export const Default: Story = {
  args: {
    labels: ["Title", "Author", "Year"],
    cellStyles: [{ left: "48px" }, { left: "320px" }, { left: "520px" }],
    selectable: true,
    allSelected: false,
  },
};

export const PageSelected: Story = {
  args: { ...Default.args, allSelected: true },
};

export const NotSelectable: Story = {
  args: {
    ...Default.args,
    selectable: false,
    cellStyles: [{ left: "8px" }, { left: "280px" }, { left: "480px" }],
  },
};
