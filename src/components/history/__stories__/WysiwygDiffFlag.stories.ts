import type { Meta, StoryObj } from "@storybook/vue3-vite";
import WysiwygDiffFlag from "../WysiwygDiffFlag.vue";

const meta: Meta<typeof WysiwygDiffFlag> = {
  title: "History/WysiwygDiffFlag",
  component: WysiwygDiffFlag,
  parameters: {
    docs: {
      description: {
        component:
          "Says whether a rich-text field changed between two versions: a " +
          'green "Changed" chip, or a neutral "Unchanged" one. Rich text is ' +
          "not diffed word by word, so the flag is the summary.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof WysiwygDiffFlag>;

export const Default: Story = {
  args: { label: "Description", changed: true },
};

export const States: Story = {
  render: () => ({
    components: { WysiwygDiffFlag },
    template: `
      <div style="display:flex;flex-direction:column;gap:8px">
        <wysiwyg-diff-flag label="Description" :changed="true" />
        <wysiwyg-diff-flag label="Transcription" :changed="false" />
      </div>`,
  }),
};
