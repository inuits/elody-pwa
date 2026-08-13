import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { Editor } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import WYSIWYGButtons from "./WYSIWYGButtons.vue";
import { useEditMode } from "@/composables/useEdit";
import { WysiwygExtensions } from "@/generated-types/queries";

// The toolbar operates on a live tiptap editor; the story creates one with
// the starter kit so every button has a target.
const meta: Meta<typeof WYSIWYGButtons> = {
  title: "EntityElements/Wysiwyg/WYSIWYGButtons",
  component: WYSIWYGButtons,
  tags: ["autodocs"],
  render: (args) => ({
    components: { WYSIWYGButtons },
    setup: () => {
      useEditMode(args.formId).enableEdit();
      const editor = new Editor({
        extensions: [StarterKit],
        content:
          "<p>Ceremonial mask from the Kuba kingdom, wood and raffia.</p>",
      });
      return { args, editor };
    },
    template:
      '<div class="max-w-3xl p-4 bg-background-light"><WYSIWYGButtons v-bind="args" :editor="editor" /></div>',
  }),
};
export default meta;

type Story = StoryObj<typeof WYSIWYGButtons>;

export const StarterKitToolbar: Story = {
  args: {
    formId: "wysiwyg-buttons-demo",
    extensions: [WysiwygExtensions.StarterKit],
    displayInline: false,
    // The live editor instance is created in the render function; this
    // placeholder only satisfies the required prop typing.
    editor: undefined as unknown as Editor,
  },
};

export const BoldAndItalicOnly: Story = {
  args: {
    formId: "wysiwyg-buttons-minimal-demo",
    extensions: [WysiwygExtensions.Bold, WysiwygExtensions.Italic],
    displayInline: true,
    editor: undefined as unknown as Editor,
  },
};
