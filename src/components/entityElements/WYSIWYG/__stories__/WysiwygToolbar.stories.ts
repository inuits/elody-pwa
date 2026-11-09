import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onBeforeUnmount } from "vue";
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import WYSIWYGButtons from "../WYSIWYGButtons.vue";
import { useEditMode } from "@/composables/useEdit";
import { WysiwygExtensions } from "@/generated-types/queries";

const meta: Meta<typeof WYSIWYGButtons> = {
  // Story id components-wysiwyg--toolbar, embedded by wysiwyg-editor.md.
  title: "Components/WYSIWYG",
  component: WYSIWYGButtons,
  parameters: {
    docs: {
      description: {
        component:
          "The rich-text toolbar over a live tiptap editor: block and mark " +
          "controls light up with the cursor's context, and the whole strip " +
          "disables outside edit mode. Which controls render follows the " +
          "field's configured extensions; entity tagging enters through " +
          "typed triggers (@, #), not a toolbar button.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof WYSIWYGButtons>;

const FORM_ID = "story-wysiwyg";

export const Toolbar: Story = {
  render: () => ({
    components: { WYSIWYGButtons, EditorContent },
    setup() {
      useEditMode(FORM_ID).enableEdit();
      const editor = new Editor({
        extensions: [StarterKit],
        content:
          "<h2>Verhalen uit de Noordzee</h2><p>Een <strong>bloemlezing</strong> " +
          "van kustverhalen, samengesteld voor de leesclub.</p>",
      });
      onBeforeUnmount(() => editor.destroy());
      return { editor, extensions: [WysiwygExtensions.StarterKit], formId: FORM_ID };
    },
    template: `
      <div style="max-width:640px;border:1px solid var(--color-border-panel);border-radius:var(--radius-card);background:var(--color-surface)">
        <w-y-s-i-w-y-g-buttons
          :form-id="formId"
          :editor="editor"
          :extensions="extensions"
          :display-inline="false"
        />
        <editor-content :editor="editor" style="padding:var(--spacing-ds-8)" />
      </div>`,
  }),
};
