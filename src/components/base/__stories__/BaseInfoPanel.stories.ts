import type { Meta, StoryObj } from "@storybook/vue3-vite";
import BaseInfoPanel from "../BaseInfoPanel.vue";

const meta: Meta<typeof BaseInfoPanel> = {
  title: "Base/BaseInfoPanel",
  component: BaseInfoPanel,
  argTypes: {
    onClose: { action: "close" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A floating help panel pinned to the bottom of the screen, opened " +
          "from the info icon next to a metadata title. The body is sanitized " +
          "HTML from the field's configuration.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof BaseInfoPanel>;

export const Default: Story = {
  args: {
    title: "About this field",
    content:
      "<p>The <strong>external identifier</strong> is the number the record " +
      "has in the source system.</p><ul><li>Use it to look the record up " +
      "there.</li><li>It never changes after import.</li></ul>",
  },
  render: (args) => ({
    components: { BaseInfoPanel },
    setup: () => ({ args }),
    template: `<div style="min-height:320px"><base-info-panel v-bind="args" /></div>`,
  }),
};
