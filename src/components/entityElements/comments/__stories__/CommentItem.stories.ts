import type { Meta, StoryObj } from "@storybook/vue3-vite";
import CommentItem from "../CommentItem.vue";
import CommentComposer from "../CommentComposer.vue";
import { useEditMode } from "@/composables/useEdit";
import { WysiwygExtensions } from "@/generated-types/queries";

const meta: Meta<typeof CommentItem> = {
  title: "Components/Comments",
  component: CommentItem,
  parameters: {
    docs: {
      description: {
        component:
          "Comment cards. On the record, each discussion is one card with " +
          "its status and reply count; a click opens the discussion in a " +
          "modal, where the replies sit indented under the first comment " +
          "and your own comments get Edit and Delete.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CommentItem>;

const comment = (
  id: string,
  author: string,
  at: string,
  body: string,
  extra: Record<string, string> = {},
) => ({
  id,
  uuid: id,
  type: "comment",
  intialValues: { author_name: author, created_at: at, body, ...extra },
});

const subject = comment(
  "c1",
  "Marie Vermeulen",
  "2026-08-18T09:14:00",
  "<p>The publisher is wrong: this is the 1994 reissue.</p>",
);
const resolved = comment(
  "c2",
  "Jan Persoon",
  "2026-08-12T15:40:00",
  "<p>Added the missing ISBN.</p>",
);
const reply = comment(
  "c3",
  "Jan Persoon",
  "2026-08-18T10:02:00",
  "<p>Right, I'll fix it.</p>",
);
const ownReply = comment(
  "c4",
  "Storybook User",
  "2026-08-18T11:30:00",
  "<p>Fixed it in the edition panel.</p>",
  { edited_at: "2026-08-18T11:32:00" },
);

export const List: Story = {
  render: () => ({
    components: { CommentItem },
    setup: () => ({ subject, resolved }),
    template: `
      <div style="display:flex;flex-direction:column;gap:8px;max-width:560px">
        <comment-item :comment="subject" status="open" :reply-count="2" :clickable="true" :is-new="true" />
        <comment-item :comment="resolved" status="resolved" :clickable="true" />
      </div>`,
  }),
};

export const Thread: Story = {
  render: () => ({
    components: { CommentItem },
    setup: () => ({ subject, reply, ownReply }),
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;max-width:560px">
        <comment-item :comment="subject" status="open" />
        <div style="padding-left:1.5rem;display:flex;flex-direction:column;gap:12px">
          <comment-item :comment="reply" :is-new="true" />
          <comment-item :comment="ownReply" :can-edit="true" :can-delete="true" />
        </div>
      </div>`,
  }),
};

export const Composer: Story = {
  render: () => ({
    components: { CommentComposer },
    setup() {
      useEditMode("story-comment-composer").setPermittedEditMode({
        canUpdate: true,
      });
      return {
        composer: {
          __typename: "WysiwygElement",
          label: "Comment",
          metadataKey: "body",
          extensions: [WysiwygExtensions.StarterKit],
        },
        onSubmit: () => undefined,
      };
    },
    template: `
      <div style="max-width:560px;background:var(--color-surface)">
        <comment-composer
          scratch-form-id="story-comment-composer"
          :composer="composer"
          submit-label="Post"
          :cancellable="true"
          :on-submit="onSubmit"
        />
      </div>`,
  }),
};
