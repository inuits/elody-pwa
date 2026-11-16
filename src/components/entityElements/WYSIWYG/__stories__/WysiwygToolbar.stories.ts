import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onBeforeUnmount } from "vue";
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import WYSIWYGButtons from "../WYSIWYGButtons.vue";
import { useEditMode } from "@/composables/useEdit";
import { WysiwygExtensions } from "@/generated-types/queries";

const meta: Meta<typeof WYSIWYGButtons> = {
  title: "Components/WYSIWYG",
  component: WYSIWYGButtons,
  parameters: {
    docs: {
      description: {
        component:
          "The rich-text toolbar over a live tiptap editor. The button for " +
          "the current format is filled; the buttons are disabled outside " +
          "edit mode. Which buttons render follows the field's extensions.",
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
          "<h2>Tales from the North Sea</h2><p>An <strong>anthology</strong> " +
          "of coastal stories, compiled for the reading club.</p>",
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
