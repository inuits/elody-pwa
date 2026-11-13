import type { Meta, StoryObj } from "@storybook/vue3-vite";
import MenuBadge from "../MenuBadge.vue";

const meta: Meta<typeof MenuBadge> = {
  title: "Components/MenuBadge",
  component: MenuBadge,
  parameters: {
    docs: {
      description: {
        component:
          "A count badge beside a menu item, for example unread notifications. " +
          "It hides itself at zero and caps the number at 99+.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MenuBadge>;

export const Default: Story = { args: { count: 7 } };

export const States: Story = {
  render: () => ({
    components: { MenuBadge },
    template: `
      <div style="display:flex;gap:16px;align-items:center">
        <span v-for="count in [0, 3, 42, 120]" :key="count" style="display:flex;gap:6px;align-items:center;font-size:var(--text-label)">
          {{ count }}: <menu-badge :count="count" />
        </span>
      </div>`,
  }),
};
