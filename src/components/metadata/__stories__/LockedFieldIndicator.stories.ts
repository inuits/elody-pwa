import type { Meta, StoryObj } from "@storybook/vue3-vite";
import LockedFieldIndicator from "../LockedFieldIndicator.vue";

const meta: Meta<typeof LockedFieldIndicator> = {
  title: "Metadata/LockedFieldIndicator",
  component: LockedFieldIndicator,
  parameters: {
    docs: {
      description: {
        component:
          "A lock in the corner of a field that cannot be edited because it " +
          "is locked, with a tooltip saying why. It positions itself " +
          "absolutely, so its parent must be relatively positioned.",
      },
    },
  },
  argTypes: {
    position: {
      control: "inline-radio",
      options: ["top-right", "middle-right"],
    },
    tooltip: { control: "text", type: { name: "string", required: false } },
  },
};

export default meta;
type Story = StoryObj<typeof LockedFieldIndicator>;

export const Default: Story = {
  args: { isLocked: true, position: "top-right", tooltip: "" },
  render: (args) => ({
    components: { LockedFieldIndicator },
    setup: () => ({ args }),
    template: `
      <div style="position:relative;max-width:420px;padding:8px 32px 8px 8px;background:var(--color-surface);border:1px solid var(--color-border-default)">
        <p style="font-size:var(--text-label);font-weight:700;color:var(--color-text-field-label)">Inventory number</p>
        <p style="font-size:var(--text-value)">INV-2024-0012</p>
        <locked-field-indicator v-bind="args" />
      </div>`,
  }),
};
