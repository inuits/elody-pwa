import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { Editor } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import WYSIGYGVirtualKeyboard from "./WYSIGYGVirtualKeyboard.vue";

// Renders the virtual keyboard toggle for a wysiwyg editor. Click the
// keyboard icon to open the simple-keyboard layout; key presses are inserted
// into the tiptap editor created by the story.
const greekLayout = {
  Greek: {
    default: [
      "α β γ δ ε ζ η θ {bksp}",
      "ι κ λ μ ν ξ ο π {space}",
      "ρ σ τ υ φ χ ψ ω {enter}",
    ],
    shift: [
      "Α Β Γ Δ Ε Ζ Η Θ {bksp}",
      "Ι Κ Λ Μ Ν Ξ Ο Π {space}",
      "Ρ Σ Τ Υ Φ Χ Ψ Ω {enter}",
    ],
  },
};

const meta: Meta<typeof WYSIGYGVirtualKeyboard> = {
  title: "EntityElements/Wysiwyg/WYSIGYGVirtualKeyboard",
  component: WYSIGYGVirtualKeyboard,
  tags: ["autodocs"],
  render: (args) => ({
    components: { WYSIGYGVirtualKeyboard },
    setup: () => {
      const editor = new Editor({
        extensions: [StarterKit],
        content: "<p>Επιγραφή</p>",
      });
      return { args, editor };
    },
    template:
      '<div class="max-w-xl p-4"><WYSIGYGVirtualKeyboard v-bind="args" :editor="editor" /></div>',
  }),
};
export default meta;

type Story = StoryObj<typeof WYSIGYGVirtualKeyboard>;

export const GreekLayout: Story = {
  args: {
    // The live editor instance is created in the render function; this
    // placeholder only satisfies the required prop typing.
    editor: undefined as unknown as Editor,
    keyboardClass: "storybook-wysiwyg-keyboard",
    extraLayouts: greekLayout,
  },
};
