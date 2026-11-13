import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { onBeforeUnmount } from "vue";
import { Editor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import WYSIWYGTransliterationToggle from "../WYSIWYGTransliterationToggle.vue";

const greekToLatin = {
  label: "Latin",
  mapping: {
    α: "a",
    β: "b",
    γ: "g",
    δ: "d",
    ε: "e",
    ι: "i",
    κ: "k",
    λ: "l",
    μ: "m",
    ν: "n",
    ο: "o",
    π: "p",
    ρ: "r",
    σ: "s",
    ς: "s",
    τ: "t",
    υ: "y",
    ω: "o",
    Θ: "Th",
    θ: "th",
    ά: "a",
    έ: "e",
    ί: "i",
    ό: "o",
    ύ: "y",
    ώ: "o",
  },
  insertSpaces: false,
};

const meta: Meta<typeof WYSIWYGTransliterationToggle> = {
  title: "EntityElements/WYSIWYGTransliterationToggle",
  component: WYSIWYGTransliterationToggle,
  parameters: {
    docs: {
      description: {
        component:
          "Segmented toggle on a WYSIWYG field's label line that shows the text in another script. " +
          "It only transforms the view: the stored text is untouched, and the toggle is hidden while editing.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof WYSIWYGTransliterationToggle>;

export const Default: Story = {
  args: {
    transliterationConfig: {
      __typename: "WysiwygTransliterationConfig",
      original: { label: "Original", mapping: null },
      latin: greekToLatin,
    } as never,
  },
  argTypes: { editor: { control: false } },
  render: (args) => ({
    components: { WYSIWYGTransliterationToggle, EditorContent },
    setup() {
      const editor = new Editor({
        extensions: [StarterKit],
        editable: false,
        content: "<p>Θάλασσα και ποταμός, ιστορία του βορρά.</p>",
      });
      onBeforeUnmount(() => editor.destroy());
      return { args, editor };
    },
    template: `
      <div style="max-width:480px;display:flex;flex-direction:column;gap:8px">
        <w-y-s-i-w-y-g-transliteration-toggle :transliteration-config="args.transliterationConfig" :editor="editor" />
        <editor-content :editor="editor" style="border:1px solid var(--color-border-default);border-radius:var(--radius-input);padding:8px;background:var(--color-surface)" />
      </div>`,
  }),
};
