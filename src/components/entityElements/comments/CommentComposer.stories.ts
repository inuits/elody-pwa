import type { Meta, StoryObj } from "@storybook/vue3-vite";
import CommentComposer from "./CommentComposer.vue";
import {
  WysiwygExtensions,
  type WysiwygElement,
} from "@/generated-types/queries";

// The composer manages its own scratch form and inline wysiwyg editor
// (starter kit); submitting calls the onSubmit prop with the html body and
// any tagged relations.
const composerElement = {
  __typename: "WysiwygElement",
  label: "comments.new-thread",
  metadataKey: "body",
  extensions: [WysiwygExtensions.StarterKit],
  taggingConfiguration: undefined,
  // The wysiwyg component dereferences this without optional chaining once
  // the editor is ready, so the fixture must carry a configuration object.
  wysiwygElementConfiguration: {
    __typename: "WysiwygElementConfiguration",
    customEditorStyles: null,
    showLineNumbers: false,
    transliterationConfig: null,
    virtualKeyboardLayouts: null,
  },
} as unknown as WysiwygElement;

const meta: Meta<typeof CommentComposer> = {
  title: "EntityElements/Comments/CommentComposer",
  component: CommentComposer,
  tags: ["autodocs"],
  decorators: [() => ({ template: '<div class="max-w-xl p-4"><story /></div>' })],
};
export default meta;

type Story = StoryObj<typeof CommentComposer>;

export const NewComment: Story = {
  args: {
    scratchFormId: "comment-composer-new-demo",
    composer: composerElement,
    submitLabel: "Post",
    onSubmit: async () => {},
  },
};

export const EditWithCancel: Story = {
  args: {
    scratchFormId: "comment-composer-edit-demo",
    composer: composerElement,
    initialBody:
      "<p>The attribution to the Kocx workshop looks solid to me.</p>",
    submitLabel: "Save",
    cancellable: true,
    onSubmit: async () => {},
  },
};
