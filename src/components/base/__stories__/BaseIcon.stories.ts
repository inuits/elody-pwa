import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseIcon from "../BaseIcon.vue";
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
